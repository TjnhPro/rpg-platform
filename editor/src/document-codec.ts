import { createDocumentEnvelope, type DocumentEnvelope, type DocumentEnvelopeInput } from './document-envelope.js';

export interface DocumentDecodeDiagnostic {
  readonly code: 'INVALID_INPUT' | 'INVALID_JSON' | 'DUPLICATE_KEY' | 'LIMIT_EXCEEDED'
    | 'UNSUPPORTED_SCHEMA' | 'INVALID_ENVELOPE';
  /** Fixed safe message; never includes untrusted document text or native causes. */
  readonly message: string;
}

export type DocumentDecodeResult =
  | { readonly status: 'decoded'; readonly document: DocumentEnvelope }
  | { readonly status: 'rejected'; readonly diagnostic: DocumentDecodeDiagnostic };

// Fixed codec profile limits, not storage byte limits. Root container depth is 1.
const MAX_UNITS = 1_048_576;
const MAX_DEPTH = 64;
const MAX_VALUES = 100_000;

/** Bound traversal before invoking the existing recursive portability validator. */
function boundGraph(root: unknown): void {
  const stack: { value: unknown; depth: number; leave?: true }[] = [{ value: root, depth: 1 }];
  const ancestors = new Set<object>();
  let values = 0;
  let units = 0;
  while (stack.length !== 0) {
    const entry = stack.pop()!;
    const value = entry.value;
    if (entry.leave) { ancestors.delete(value as object); continue; }
    if (++values > MAX_VALUES) throw new RangeError('Document codec value limit exceeded');
    if (typeof value === 'string') units += value.length;
    if (units > MAX_UNITS) throw new RangeError('Document codec string limit exceeded');
    if (typeof value !== 'object' || value === null) continue;
    if (entry.depth > MAX_DEPTH) throw new RangeError('Document codec depth limit exceeded');
    if (ancestors.has(value)) throw new TypeError('Document codec does not support cycles');
    ancestors.add(value);
    stack.push({ value, depth: entry.depth, leave: true });
    const keys = Reflect.ownKeys(value);
    if (keys.length > MAX_VALUES || stack.length + keys.length > 2 * MAX_VALUES) {
      throw new RangeError('Document codec value limit exceeded');
    }
    for (const key of keys) {
      if (Array.isArray(value) && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !('value' in descriptor)) throw new TypeError('Document codec requires data properties');
      if (typeof key === 'string') units += key.length;
      if (units > MAX_UNITS) throw new RangeError('Document codec string limit exceeded');
      stack.push({ value: descriptor.value, depth: entry.depth + 1 });
    }
  }
}

/**
 * Pure compact JSON for envelope schema 1; never Save or a dirty-state mutation.
 * Reuse canonical capture BEFORE stringify: no toJSON callbacks or silent dropping
 * of unsupported values. Unknown portable content keys (including __proto__) are
 * retained as data, not merged into prototypes. Root/identity fields remain exact.
 * Limits: 1,048,576 UTF-16 units of output, 64 container levels, 100,000 values.
 * ECMAScript property order/numeric rendering, no newline/BOM, sorting, hashing or
 * cryptographic canonicalization. Equal records with different insertion order
 * need not have equal bytes. Numbers are finite binary64 excluding negative zero;
 * arbitrary-precision integers/decimal lexemes are not lossless. Encode errors
 * throw TypeError/RangeError; native host/proxy exceptions propagate.
 */
export function serializeDocument(document: DocumentEnvelope): string {
  boundGraph(document);
  const captured = createDocumentEnvelope(document);
  const text = JSON.stringify(captured);
  if (text.length > MAX_UNITS) throw new RangeError('Document codec text limit exceeded');
  return text;
}

class JsonProfileError extends Error {
  constructor(readonly code: 'DUPLICATE_KEY' | 'LIMIT_EXCEEDED') { super(code); }
}

/** Lexical guard only; native JSON.parse remains the JSON grammar authority. */
function inspectJson(text: string): void {
  const stack: (Set<string> | null)[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '{' || char === '[') {
      stack.push(char === '{' ? new Set() : null);
      if (stack.length > MAX_DEPTH) throw new JsonProfileError('LIMIT_EXCEEDED');
    } else if (char === '}' || char === ']') {
      stack.pop();
    } else if (char === '"') {
      const start = index;
      for (index += 1; index < text.length && text[index] !== '"'; index += 1) {
        if (text[index] === '\\') index += 1;
      }
      let next = index + 1;
      while (next < text.length && /\s/u.test(text[next]!)) next += 1;
      const keys = stack[stack.length - 1];
      if (text[next] === ':' && keys instanceof Set) {
        const key: string = JSON.parse(text.slice(start, index + 1));
        if (keys.has(key)) throw new JsonProfileError('DUPLICATE_KEY');
        keys.add(key);
      }
    }
  }
}

const messages: Readonly<Record<DocumentDecodeDiagnostic['code'], string>> = Object.freeze({
  INVALID_INPUT: 'Document JSON input must be a string.',
  INVALID_JSON: 'Document JSON syntax is invalid.',
  DUPLICATE_KEY: 'Document JSON contains duplicate object keys.',
  LIMIT_EXCEEDED: 'Document JSON exceeds codec resource limits.',
  UNSUPPORTED_SCHEMA: 'Document envelope schema version is unsupported; no migration performed.',
  INVALID_ENVELOPE: 'Document envelope or portable content is invalid.',
});

function rejected(code: DocumentDecodeDiagnostic['code']): DocumentDecodeResult {
  return Object.freeze({ status: 'rejected', diagnostic: Object.freeze({ code, message: messages[code] }) });
}

/**
 * Parse untrusted JSON with no reviver/code execution, no fallback document and
 * no automatic upgrade. Reject duplicates (including escaped-equivalent names),
 * malformed/excessive input, invalid portable values and unsupported envelopes.
 * Return detached/frozen authored data only. No IO, owner-schema interpretation,
 * reference resolution, session adoption, saved evidence or write authorization.
 * Same size/depth/value bounds as encode; input length counts UTF-16 code units,
 * not UTF-8 bytes. JSON.parse uses binary64, so numeric text may already round;
 * precision-sensitive keys/values must be authored as strings.
 */
export function deserializeDocument(text: string): DocumentDecodeResult {
  if (typeof text !== 'string') return rejected('INVALID_INPUT');
  if (text.length > MAX_UNITS) return rejected('LIMIT_EXCEEDED');
  let parsed: unknown;
  try {
    inspectJson(text);
    parsed = JSON.parse(text);
  } catch (error) {
    if (error instanceof JsonProfileError) return rejected(error.code);
    if (error instanceof SyntaxError) return rejected('INVALID_JSON');
    throw error;
  }
  try {
    boundGraph(parsed);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      && 'schemaVersion' in parsed && typeof parsed.schemaVersion === 'number' && parsed.schemaVersion !== 1) {
      return rejected('UNSUPPORTED_SCHEMA');
    }
    const document = createDocumentEnvelope(parsed as DocumentEnvelopeInput);
    return Object.freeze({ status: 'decoded', document });
  } catch (error) {
    if (error instanceof RangeError) return rejected('LIMIT_EXCEEDED');
    if (error instanceof TypeError) return rejected('INVALID_ENVELOPE');
    throw error;
  }
}
