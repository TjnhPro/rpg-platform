import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Editor-local enforcement of ui-styling-policy.md, EC-01 through EC-07.
// No CLI exclusions, disable comments or feature-owned exceptions are supported.
// Change these rules only with a Developer-approved policy delta, never to pass a feature.
const editor = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.dirname(editor);
const ui = path.join(editor, 'ui');
const src = path.join(ui, 'src');
const main = path.join(src, 'main.tsx');
const theme = path.join(src, 'theme/theme.ts');
const viteConfig = path.join(ui, 'vite.config.ts');
const exceptions = Object.freeze([]); // Locked empty: no raw-control/reset/style exceptions.
const diagnostics = [];
const sources = new Map();
const moduleClasses = new Map();
const codeExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/i;
const styleExtension = /\.(?:css|scss|sass|less|styl|stylus)$/i;
const rawControls = new Set(['button', 'input', 'select', 'textarea']);
const interactiveRoles = new Set(['button', 'checkbox', 'combobox', 'listbox', 'menuitem', 'radio', 'slider', 'switch', 'tab', 'textbox']);
const designProps = new Set(('p px py pt pb pl pr ps pe m mx my mt mb ml mr ms me gap rowGap columnGap c color bg opacity radius fz fw ff lh lts ta tt td w h miw mih maw mah size width height fontSize fontFamily fontWeight lineHeight letterSpacing borderRadius background backgroundColor margin padding top right bottom left inset flexBasis').split(' '));
const geometryProps = new Set(['w', 'h', 'miw', 'mih', 'maw', 'mah', 'width', 'height', 'flexBasis']);
const mantineScales = new Set(['xs', 'sm', 'md', 'lg', 'xl']);
const counts = { theme: [], provider: [], globalCss: [] };
let program;
let checker;

const slash = (value) => value.replaceAll('\\', '/');
const relative = (file) => slash(path.relative(repo, file));
const inside = (root, file) => file === root || (!path.relative(root, file).startsWith(`..${path.sep}`) && path.relative(root, file) !== '..' && !path.isAbsolute(path.relative(root, file)));
function report(file, position, rule, message, severity = 'error') {
  const content = sources.get(file)?.text ?? (fs.existsSync(file) && fs.statSync(file).isFile() ? fs.readFileSync(file, 'utf8') : '');
  const line = content.slice(0, Math.max(0, position)).split('\n').length;
  const item = { file: relative(file), line, rule, message, severity };
  if (!diagnostics.some((other) => JSON.stringify(other) === JSON.stringify(item))) diagnostics.push(item);
}
function at(node, rule, message, severity) {
  report(path.resolve(node.getSourceFile().fileName), node.getStart(), rule, message, severity);
}
function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (file === path.join(ui, 'dist') || file === path.join(ui, 'node_modules')) continue;
    if (entry.name === 'node_modules') {
      report(file, 0, 'EC-04', 'Nested dependency-named source directory cannot hide authored UI; keep source in the inspected app tree.');
      continue;
    }
    if (entry.isSymbolicLink()) {
      report(file, 0, 'EC-04', 'Symlinked UI input cannot establish ownership; use an authored same-Editor file.');
    } else if (entry.isDirectory()) files.push(...walk(file));
    else files.push(file);
  }
  return files;
}
function unwrap(node) {
  while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node))) node = node.expression;
  return node;
}
function resolveValue(node, seen = new Set()) {
  node = unwrap(node);
  if (!node || seen.has(node)) return node;
  seen.add(node);
  if (ts.isIdentifier(node)) {
    let symbol = checker.getSymbolAtLocation(node);
    if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol?.valueDeclaration;
    if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer && inside(ui, path.resolve(declaration.getSourceFile().fileName))) {
      return resolveValue(declaration.initializer, seen);
    }
  }
  if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
    const symbol = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(node) ? node : node.argumentExpression);
    const declaration = symbol?.valueDeclaration;
    if (declaration && ts.isPropertyAssignment(declaration) && inside(ui, path.resolve(declaration.getSourceFile().fileName))) return resolveValue(declaration.initializer, seen);
    const object = resolveValue(node.expression, seen);
    const key = ts.isPropertyAccessExpression(node) ? node.name.text : literal(node.argumentExpression);
    if (object && ts.isObjectLiteralExpression(object)) {
      const property = object.properties.find((item) => ts.isPropertyAssignment(item) && item.name.text === key);
      if (property) return resolveValue(property.initializer, seen);
    }
  }
  return node;
}
function literal(node) {
  node = resolveValue(node);
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) return node.text;
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) return `${node.operator === ts.SyntaxKind.MinusToken ? '-' : '+'}${node.operand.text}`;
  return undefined;
}
function symbolOrigin(node, seen = new Set()) {
  node = unwrap(node);
  if (!node || seen.has(node)) return null;
  seen.add(node);
  let symbol = checker.getSymbolAtLocation(node);
  if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
  if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer && inside(ui, path.resolve(declaration.getSourceFile().fileName))) {
    return symbolOrigin(declaration.initializer, seen);
  }
  return declaration ? { name: symbol.getName(), file: slash(declaration.getSourceFile().fileName) } : null;
}
function fromMantine(node, name) {
  const origin = symbolOrigin(node);
  return origin?.file.includes('/node_modules/@mantine/core/') && (!name || origin.name === name);
}
function propsFrom(node, seen = new Set()) {
  node = resolveValue(node);
  if (!node || seen.has(node)) return null;
  seen.add(node);
  if (!ts.isObjectLiteralExpression(node)) return null;
  const result = [];
  for (const property of node.properties) {
    if (ts.isSpreadAssignment(property)) {
      const nested = propsFrom(property.expression, seen);
      if (nested) result.push(...nested);
      else at(property, 'EC-03', 'Unresolved props spread: manually review styling/control props; use explicit Mantine props.', 'warning');
    } else {
      const name = ts.isComputedPropertyName(property.name) ? literal(property.name.expression) : property.name.text;
      if (name === undefined) at(property, 'EC-03', 'Computed prop name needs manual style/control review.', 'warning');
      else result.push({ name, node: property, value: ts.isPropertyAssignment(property) ? property.initializer : ts.isShorthandPropertyAssignment(property) ? property.name : property });
    }
  }
  return result;
}
function styleValue(node, prop, location) {
  // Establish provenance before resolving aliases; a local object named editorTokens is not trusted.
  if (symbolOrigin(node)?.file === slash(theme)) return;
  node = resolveValue(node);
  if (!node) return;
  if (ts.isConditionalExpression(node)) {
    styleValue(node.whenTrue, prop, location);
    styleValue(node.whenFalse, prop, location);
    return;
  }
  if (ts.isObjectLiteralExpression(node)) {
    // Mantine responsive values use the theme's named breakpoints only.
    for (const item of propsFrom(node) ?? []) {
      if (!['base', ...mantineScales].includes(item.name)) at(item.node, 'EC-02', 'Use named Mantine breakpoints, not a numeric/custom breakpoint.');
      styleValue(item.value, prop, item.node);
    }
    return;
  }
  const value = literal(node);
  if (value !== undefined) {
    const numeric = /[+-]?(?:\d*\.)?\d+(?:[a-z%]+)?/i.test(value.replace(/var\(\s*--mantine-[\w-]+\s*\)/g, 'TOKEN'));
    const geometry = geometryProps.has(prop) && ['0', '100%', 'auto'].includes(value);
    if ((!geometry && numeric) || /#(?:[\da-f]{3,8})\b|(?:rgb|hsl|hwb|lab|lch|oklab|oklch|color|calc)\s*\(/i.test(value)) {
      at(location, 'EC-02', `Literal design value for ${prop}; use editorTokens/Mantine scale props (structural geometry only where justified).`);
    } else if (['c', 'color', 'bg', 'background', 'backgroundColor'].includes(prop) && !/^var\(\s*--mantine-[\w-]+\s*\)$/.test(value)) {
      at(location, 'EC-02', `Use editorTokens.colors for ${prop}, not a local palette/color literal.`);
    } else if (['ff', 'fontFamily'].includes(prop) || (/^(?:[pm](?:[xytrblse])?|gap|rowGap|columnGap|radius|size|fz)$/.test(prop) && !mantineScales.has(value) && !/^var\(\s*--mantine-[\w-]+\s*\)$/.test(value) && !geometry)) {
      at(location, 'EC-02', `Use centralized Mantine size/radius/typography tokens for ${prop}.`);
    }
    return;
  }
  // Imported semantic tokens are canonical. Other dynamic values remain visible for review.
  const origin = symbolOrigin(ts.isPropertyAccessExpression(node) ? node.expression : node);
  if (origin?.file === slash(theme)) return;
  at(location, 'EC-02', `Dynamic ${prop} value needs manual token/geometry review; prefer editorTokens.`, 'warning');
}
function importedModule(node) {
  for (let current = node; current; current = current.parent) {
    if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) return current.moduleSpecifier?.text;
  }
  return undefined;
}
function classReference(node) {
  node = unwrap(node);
  if (!node || (!ts.isPropertyAccessExpression(node) && !ts.isElementAccessExpression(node))) return false;
  const key = ts.isPropertyAccessExpression(node) ? node.name.text : literal(node.argumentExpression);
  const symbol = checker.getSymbolAtLocation(node.expression);
  const declaration = symbol?.declarations?.find(ts.isImportClause);
  const specifier = declaration && importedModule(declaration);
  if (!specifier?.endsWith('.module.css')) return false;
  const target = path.resolve(path.dirname(node.getSourceFile().fileName), specifier);
  if (!moduleClasses.has(target)) return false;
  if (key === undefined) at(node, 'EC-03', 'Dynamic Module class needs manual review; prefer classes.localName.', 'warning');
  else if (!moduleClasses.get(target).has(key)) at(node, 'EC-03', `Unknown local Module class ${key}; map a declared structural class.`);
  return true;
}
function checkClass(node, slots = false) {
  node = resolveValue(node);
  if (!node) return;
  if (ts.isConditionalExpression(node)) {
    checkClass(node.whenTrue, slots);
    checkClass(node.whenFalse, slots);
  } else if (slots && ts.isObjectLiteralExpression(node)) {
    for (const property of propsFrom(node) ?? []) checkClass(property.value);
  } else if (classReference(node) || node.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(node) && node.text === 'undefined')) {
    return;
  } else if (literal(node) !== undefined) at(node, 'EC-03', 'Raw class string is forbidden; use an approved structural CSS Module binding.');
  else at(node, 'EC-03', 'Unresolved class mapping needs manual structural Module review; prefer classes.localName.', 'warning');
}
function inspectProps(properties, tag, isMantine, location, depth = 0) {
  if (depth > 8) {
    at(location, 'EC-03', 'Deep/recursive forwarded props need manual styling review.', 'warning');
    return;
  }
  const component = location.tagName ?? location.arguments?.[0];
  const structuralMantine = isMantine && /^(?:Box|Group|Stack|Grid|SimpleGrid|Paper|Text|Title|Container|Flex|Center|ScrollArea|AppShell|Fieldset)$/.test(symbolOrigin(component)?.name ?? '');
  if (fromMantine(component, 'MantineProvider') && path.resolve(location.getSourceFile().fileName) === main) {
    const props = new Map(properties.map((item) => [item.name, item]));
    for (const name of ['theme', 'cssVariablesResolver', 'colorSchemeManager']) {
      const value = resolveValue(props.get(name)?.value);
      if (!value || value.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(value) && value.text === 'undefined')) at(location, name === 'colorSchemeManager' ? 'EC-06' : 'EC-02', `Entry provider must explicitly retain ${name}; no library-default persisted scheme or alternate theme.`);
    }
    if (literal(props.get('forceColorScheme')?.value) !== 'dark') at(location, 'EC-06', 'Entry provider must retain forceColorScheme="dark" and the explicit nonpersistent manager.');
  }
  for (const { name, node, value } of properties) {
    if (['style', 'styles', 'dangerouslySetInnerHTML', 'srcDoc'].includes(name)) at(node, 'EC-03', `Authored ${name} is forbidden; use Mantine props/defaults or a justified structural Module.`);
    if (name === 'className' || name === 'classNames') checkClass(value, name === 'classNames');
    if (name === 'role' && interactiveRoles.has(literal(value)) && (!isMantine || structuralMantine)) at(node, 'EC-01', 'Do not replace a Mantine control with an interactive role.');
    if (/^on(?:Click|DoubleClick|MouseDown|PointerDown)(?:Capture)?$/.test(name) && (/^[a-z]/.test(tag) || structuralMantine) && !['canvas', 'form'].includes(tag)) at(node, 'EC-01', 'Interactive layout element; use Mantine Button/ActionIcon/control.');
    if (/^onKey(?:Down|Up)$/.test(name) && /^[a-z]/.test(tag)) at(node, 'EC-01', 'Keyboard listener on a native element needs manual control/accessibility review.', 'warning');
    if (name === 'component' && rawControls.has(literal(value)) && (!isMantine || structuralMantine)) at(node, 'EC-01', 'Polymorphic raw control is forbidden; use its Mantine control.');
    if (tag === 'canvas' && ['width', 'height'].includes(name)) at(node, 'EC-05', 'Native canvas dimensions belong to Render; use existing viewport-host and CSS display geometry.');
    if (['theme', 'defaultProps', 'cssVariablesResolver'].includes(name) && path.resolve(location.getSourceFile().fileName) !== main) at(node, 'EC-02', 'Theme/default configuration belongs to the canonical theme and entry provider.');
    if (designProps.has(name)) styleValue(value, name, node);
    if (/Props$/.test(name) && value) {
      const nested = propsFrom(value);
      if (nested) inspectProps(nested, '', true, node, depth + 1);
      else at(node, 'EC-03', 'Forwarded component props need manual styling/control review; prefer explicit props.', 'warning');
    }
  }
}

function inspectImport(specifier, node, isModuleBinding = true) {
  const file = path.resolve(node.getSourceFile().fileName);
  if (typeof specifier !== 'string') {
    at(node, 'EC-04', 'Computed module import needs manual boundary review; use a static public/same-Editor import.', 'warning');
    return;
  }
  if (specifier === '@mantine/core/styles.css') {
    counts.globalCss.push(node);
    if (file !== main) at(node, 'EC-03', 'Only src/main.tsx may import distributed Mantine styles.css.');
    return;
  }
  if (styleExtension.test(specifier.split(/[?#]/)[0])) {
    const target = path.resolve(path.dirname(file), specifier);
    if (!specifier.endsWith('.module.css') || !moduleClasses.has(target) || !isModuleBinding) at(node, 'EC-03', 'Import a bound CSS Module from an approved layout/panel/viewport area; global/side-effect styles are forbidden.');
    return;
  }
  if (specifier.startsWith('.')) {
    const resolved = ts.resolveModuleName(specifier, file, program.getCompilerOptions(), ts.sys).resolvedModule;
    if (!resolved) {
      at(node, 'EC-04', 'Cannot resolve local UI input; use an inspectable same-Editor source module.');
      return;
    }
    const target = path.resolve(resolved.resolvedFileName);
    const approvedDomain = target === path.join(editor, 'src/index.ts') || target === path.join(editor, 'src/viewport-host.ts');
    if ((!inside(ui, target) && !approvedDomain) || inside(path.join(ui, 'dist'), target) || target.includes(`${path.sep}manual${path.sep}`) || target.includes(`${path.sep}node_modules${path.sep}`)) at(node, 'EC-04', 'Use Editor root/index or existing viewport-host; no private cross-project/generated/manual imports.');
    return;
  }
  const packages = ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', '@mantine/core', '@mantine/hooks', '@rpg-platform/editor', '@rpg-platform/runtime-engine', '@rpg-platform/runtime-render'];
  const tooling = file === viteConfig && ['node:url', 'vite', '@vitejs/plugin-react'].includes(specifier);
  if (!packages.includes(specifier) && !tooling) at(node, 'EC-04', 'Import outside approved React/Mantine stack or public owner roots; do not add a UI kit/private API.');
}

function inspectSource(source) {
  const file = path.resolve(source.fileName);
  for (const diagnostic of source.parseDiagnostics) report(file, diagnostic.start ?? 0, 'EC-03', `Cannot parse UI source: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  // Comments are inspected separately from AST literals; quoted documentation is not code.
  const commentScanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, source.text);
  for (let token = commentScanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = commentScanner.scan()) {
    if ([ts.SyntaxKind.SingleLineCommentTrivia, ts.SyntaxKind.MultiLineCommentTrivia].includes(token) && /(?:ui[-:]?(?:check|contract)[- :](?:disable|ignore|allow)|@ts-(?:ignore|nocheck)|eslint-disable)/i.test(commentScanner.getTokenText())) report(file, commentScanner.getTokenPos(), 'EC-06', 'Checker suppression is not an exception; request a concrete Developer policy decision.');
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) inspectImport(node.moduleSpecifier.text, node, ts.isImportDeclaration(node) && Boolean(node.importClause?.name));
    }
    if (ts.isImportEqualsDeclaration(node)) at(node, 'EC-04', 'Unsupported require-style UI import; use static ESM public imports.');
    if (ts.isImportTypeNode(node)) inspectImport(ts.isLiteralTypeNode(node.argument) ? node.argument.literal.text : undefined, node);
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = literal(node.tagName) ?? node.tagName.getText();
      const mantine = fromMantine(node.tagName);
      if (rawControls.has(tag)) at(node, 'EC-01', `Raw <${tag}> is forbidden; use Mantine ${tag === 'button' ? 'Button' : tag === 'input' ? 'TextInput/NumberInput/Checkbox' : tag === 'select' ? 'Select' : 'Textarea'}.`);
      if (['style', 'link', 'script'].includes(tag)) at(node, 'EC-03', 'Do not inject stylesheets/style/script elements; use the locked entry and Mantine/Module imports.');
      if (fromMantine(node.tagName, 'MantineProvider')) {
        counts.provider.push(node);
        if (file !== main) at(node, 'EC-02', 'MantineProvider belongs only to src/main.tsx; no nested theme.');
      }
      const properties = [];
      for (const prop of node.attributes.properties) {
        if (ts.isJsxSpreadAttribute(prop)) {
          const entries = propsFrom(prop.expression);
          if (entries) properties.push(...entries);
          else at(prop, 'EC-03', 'Unresolved JSX props spread needs manual review; prefer explicit Mantine props.', 'warning');
        } else properties.push({ name: prop.name.getText(), node: prop, value: prop.initializer && (ts.isJsxExpression(prop.initializer) ? prop.initializer.expression : prop.initializer) });
      }
      inspectProps(properties, tag, mantine, node);
    }
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const expression = node.expression;
      const origin = symbolOrigin(expression);
      const writtenOperation = ts.isPropertyAccessExpression(expression) ? expression.name.text : ts.isElementAccessExpression(expression) ? literal(expression.argumentExpression) : ts.isIdentifier(expression) ? expression.text : undefined;
      const operation = origin?.name ?? writtenOperation;
      const dom = origin?.file.endsWith('/lib.dom.d.ts');
      const react = origin?.file.includes('/node_modules/@types/react/') || origin?.file.includes('/node_modules/react/');
      if (ts.isCallExpression(node) && expression.kind === ts.SyntaxKind.ImportKeyword) inspectImport(literal(node.arguments[0]), node);
      if (operation === 'require' || operation === 'glob') at(node, 'EC-04', 'Runtime require/import glob cannot establish static UI ownership; use explicit ESM imports.');
      if (fromMantine(expression, 'createTheme')) {
        counts.theme.push(node);
        if (file !== theme) at(node, 'EC-02', 'createTheme belongs only to src/theme/theme.ts.');
      }
      if (fromMantine(expression) && operation === 'extend' && file !== theme) at(node, 'EC-02', 'Component defaults/extensions belong to the canonical theme, not a competing local control.');
      if ((react && ['createElement', 'jsx', 'jsxs', 'jsxDEV'].includes(operation)) || (dom && operation === 'createElement')) {
        const tag = literal(node.arguments[0]);
        if (rawControls.has(tag)) at(node, 'EC-01', 'Raw control factory is forbidden; use Mantine controls.');
        const props = propsFrom(node.arguments[1]);
        if (props) inspectProps(props, tag ?? '', fromMantine(node.arguments[0]), node);
        if (['style', 'link', 'script'].includes(tag) || (dom && tag === 'canvas')) at(node, tag === 'canvas' ? 'EC-05' : 'EC-03', 'Do not allocate/inject browser targets; React mounts canvas for the existing viewport-host.');
        if (fromMantine(node.arguments[0], 'MantineProvider')) {
          counts.provider.push(node);
          if (file !== main) at(node, 'EC-02', 'MantineProvider belongs only to src/main.tsx.');
        }
      }
      const viewportOperation = ['requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver', 'IntersectionObserver', 'matchMedia', 'OffscreenCanvas', 'getContext', 'transferControlToOffscreen'].includes(operation);
      if (viewportOperation && dom) at(node, 'EC-05', 'Viewport observation/scheduling/GPU allocation belongs to existing viewport-host/Render.');
      else if (viewportOperation && !origin) at(node, 'EC-05', 'Unresolved viewport-like call needs manual owner review; use the existing viewport-host.', 'warning');
      if (dom && operation === 'setAttribute' && ['width', 'height', 'style'].includes(literal(node.arguments[0]))) at(node, 'EC-05', 'Do not imperatively size/style native targets; use Mantine/Module CSS and viewport-host.');
      if (dom && operation === 'setProperty') at(node, 'EC-03', 'Imperative style/token mutation is forbidden; use canonical theme/structural Module.');
      if (dom && ['insertRule', 'replaceSync', 'CSSStyleSheet'].includes(operation)) at(node, 'EC-03', 'Injected stylesheets are forbidden; use Mantine or a justified structural Module.');
      if (dom && ['insertAdjacentHTML', 'write', 'writeln', 'setHTML', 'setHTMLUnsafe'].includes(operation)) at(node, 'EC-03', 'Injected markup can bypass styling rules; use authored React/Mantine composition.');
      if (origin?.file.includes('/lib.es') && ['eval', 'Function', 'FunctionConstructor'].includes(operation)) at(node, 'EC-04', 'Generated executable UI cannot be inspected; use authored static modules.');
      if (fromMantine(expression, 'localStorageColorSchemeManager')) at(node, 'EC-06', 'Keep UI state transient; retain the fixed nonpersistent entry manager.');
    }
    if (ts.isIdentifier(node) && ['localStorage', 'sessionStorage', 'indexedDB', 'caches', 'cookieStore'].includes(node.text)) {
      if (symbolOrigin(node)?.file.endsWith('/lib.dom.d.ts')) at(node, 'EC-06', 'Browser persistence is forbidden; use transient React workspace state.');
    }
    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) {
      const member = ts.isPropertyAccessExpression(node) ? node.name.text : literal(node.argumentExpression);
      const dom = symbolOrigin(node)?.file.endsWith('/lib.dom.d.ts');
      if (dom && ['localStorage', 'sessionStorage', 'indexedDB', 'cookie', 'cookieStore'].includes(member)) at(node, 'EC-06', 'Browser persistence is forbidden; use transient React workspace state.');
      if (dom && member === 'devicePixelRatio') at(node, 'EC-05', 'DPR measurement belongs to existing viewport-host, not the React application.');
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      const target = node.left;
      if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) {
        const member = ts.isPropertyAccessExpression(target) ? target.name.text : literal(target.argumentExpression);
        const type = checker.typeToString(checker.getTypeAtLocation(target.expression));
        if (['width', 'height'].includes(member) && /Canvas|RenderingContext/.test(type)) at(node, 'EC-05', 'Native canvas buffer writes belong to Render; delegate to viewport-host.');
        if (member === 'style' || member === 'cssText' || /\.style(?:\.|\[)/.test(target.getText())) at(node, 'EC-03', 'Imperative inline style mutation is forbidden; use Mantine props/structural Module.');
        if (['innerHTML', 'outerHTML', 'srcdoc'].includes(member) && symbolOrigin(target)?.file.endsWith('/lib.dom.d.ts')) at(node, 'EC-03', 'Injected markup is forbidden; use authored React/Mantine composition.');
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

// A deliberately restricted structural CSS grammar, not a general CSS parser.
// Unsupported grammar fails inspection instead of silently granting new CSS capabilities.
function inspectCss(file) {
  const text = fs.readFileSync(file, 'utf8');
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n\r]/g, ' '));
  const allowedPath = /^src\/styles\/(?:layout|panel|viewport)\/(?:[^/]+\/)*[^/]+\.module\.css$/.test(slash(path.relative(ui, file)));
  if (!allowedPath) report(file, 0, 'EC-03', 'Unauthorized stylesheet; only approved layout/panel/viewport *.module.css is allowed.');
  const classes = new Set();
  moduleClasses.set(file, classes);
  let cursor = 0;
  while (cursor < clean.length) {
    if (!clean.slice(cursor).trim()) break;
    const open = clean.indexOf('{', cursor);
    const close = open < 0 ? -1 : clean.indexOf('}', open);
    if (open < 0 || close < 0 || clean.slice(open + 1, close).includes('{')) {
      report(file, cursor, 'EC-03', 'Unsupported/malformed CSS grammar; use flat local structural classes and declarations.');
      break;
    }
    const selector = clean.slice(cursor, open).trim();
    const selectorPosition = cursor + clean.slice(cursor, open).search(/\S/);
    if (!/^\.[a-zA-Z_][\w-]*(?:\s*(?:[>+~]|\s)\s*\.[a-zA-Z_][\w-]*)*(?:\s*,\s*\.[a-zA-Z_][\w-]*(?:\s*(?:[>+~]|\s)\s*\.[a-zA-Z_][\w-]*)*)*$/.test(selector) || /\.mantine-/i.test(selector)) report(file, selectorPosition, 'EC-03', 'Only local structural class selectors are allowed; no global/private/control/ID/element selectors or at-rules.');
    for (const match of selector.matchAll(/\.([\w-]+)/g)) classes.add(match[1]);
    const body = clean.slice(open + 1, close);
    let offset = open + 1;
    for (const declaration of body.split(';')) {
      const colon = declaration.indexOf(':');
      if (declaration.trim()) {
        if (colon < 0) report(file, offset, 'EC-03', 'Unsupported CSS declaration; use property: structural-value.');
        else inspectDeclaration(file, offset + declaration.search(/\S/), declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim());
      }
      offset += declaration.length + 1;
    }
    cursor = close + 1;
  }
}
function inspectDeclaration(file, position, property, value) {
  const allowed = /^(?:display|box-sizing|(?:min-|max-)?(?:(?:inline|block)-size|width|height)|flex(?:-grow|-shrink|-basis|-direction|-wrap)?|grid-template-(?:rows|columns)|grid-(?:row|column)|align-(?:items|content|self)|justify-(?:items|content|self)|overflow(?:-x|-y|-inline|-block)?|overscroll-behavior(?:-x|-y|-inline|-block)?|scroll-padding(?:-inline|-block)?(?:-start|-end)?|position|inset(?:-inline|-block)?(?:-start|-end)?)$/;
  if (!allowed.test(property)) {
    const decorative = /^(?:--|color$|background|border|outline|font|line-height$|letter-spacing$|text-|margin|padding|gap$|(?:row|column)-gap$|opacity$|box-shadow$|transform|translate$|rotate$|scale$|animation|transition|filter$)/.test(property);
    report(file, position, 'EC-03', `CSS ${property} is outside recognized structural mechanics; use Mantine props/theme for decoration and review any missing structural capability.`, decorative ? 'error' : 'warning');
  }
  if (/!\s*important/i.test(value) || /@|[\\"'{};]/.test(value) || /(?:url|expression)\s*\(/i.test(value)) report(file, position, 'EC-03', 'Unsupported/private CSS escape, import or !important; keep flat structural Module rules.');
  const withoutTokens = value.replace(/var\(\s*--mantine-[\w-]+\s*\)/g, 'TOKEN');
  if (/var\s*\(/.test(withoutTokens)) report(file, position, 'EC-03', 'Read existing Mantine variables only; no alternate token namespace/fallback literals.');
  for (const number of withoutTokens.matchAll(/(?:\d*\.)?\d+(?:[a-z%]+)?/gi)) {
    const v = number[0];
    const ratio = /^(?:flex|flex-grow|flex-shrink)$/.test(property) && /^\d+(?:\.\d+)?$/.test(v);
    const gridNumber = /^grid-(?:row|column|template-rows|template-columns)$/.test(property) && /^\d+$/.test(v);
    const geometry = /^(?:(?:min-|max-)?(?:(?:inline|block)-size|width|height)|flex-basis|grid-template-(?:rows|columns)|inset(?:-.*)?)$/.test(property) && (v === '100%' || /^\d+(?:\.\d+)?fr$/.test(v));
    if (v !== '0' && !ratio && !geometry && !gridNumber) report(file, position, 'EC-03', `Literal CSS design value ${v}; use existing var(--mantine-...) tokens, not a new scale.`);
  }
  if (/#|(?:rgb|hsl|hwb|lab|lch|color|oklab|oklch)\s*\(/i.test(withoutTokens)) report(file, position, 'EC-03', 'Raw CSS color is forbidden; use Mantine semantic props.');
}

function inspectHtml(file) {
  const text = fs.readFileSync(file, 'utf8');
  const clean = text.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n\r]/g, ' '));
  // HTML's quoted attributes can contain >; do not scan strings as tag boundaries.
  const tags = /<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  for (const match of clean.matchAll(tags)) {
    const tag = match[1].toLowerCase();
    const attrs = new Map();
    for (const attribute of match[2].matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs.set(attribute[1].toLowerCase(), attribute[2] ?? attribute[3] ?? attribute[4] ?? '');
    if (rawControls.has(tag) || interactiveRoles.has(attrs.get('role')) || [...attrs.keys()].some((key) => /^on(?:click|dblclick|pointerdown|mousedown)$/.test(key))) report(file, match.index, 'EC-01', 'Raw HTML control/interactive substitute is forbidden; mount Mantine React controls.');
    if (tag === 'style' || attrs.has('style') || attrs.has('srcdoc') || (tag === 'link' && /stylesheet/i.test(attrs.get('rel') ?? ''))) report(file, match.index, 'EC-03', 'HTML styles/stylesheet links/injected markup are forbidden; keep the sole main.tsx Mantine import.');
    if (tag === 'script') {
      if (file !== path.join(ui, 'index.html') || attrs.get('type') !== 'module' || attrs.get('src') !== '/src/main.tsx') report(file, match.index, 'EC-04', 'Only the locked /src/main.tsx module entry is allowed; no injected/remote scripts.');
      const end = clean.indexOf('</script', match.index + match[0].length);
      if (end < 0 || clean.slice(match.index + match[0].length, end).trim()) report(file, match.index, 'EC-04', 'Inline/unclosed script cannot establish UI ownership; use the authored main module.');
    }
  }
}

function inspectBuild() {
  const file = path.join(editor, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  const scripts = pkg.scripts;
  // Exact commands prevent optional chains, shell fallbacks and bypass flags.
  const expected = {
    'ui:check': 'node scripts/check-ui-contract.mjs',
    build: 'npm run ui:check && tsc -b --force && npm run ui:build',
    'ui:build': 'tsc --project ui/tsconfig.json --noEmit && vite build --config ui/vite.config.ts',
  };
  for (const [name, command] of Object.entries(expected)) if (scripts?.[name] !== command) report(file, 0, 'EC-07', `${name} must obligatorily run its locked genuine command: ${command}`);
}

try {
  if (process.argv.length !== 2 || exceptions.length !== 0) throw new Error('No suppression/scan overrides or unapproved exceptions are supported.');
  const files = walk(ui);
  for (const file of files) if (styleExtension.test(file)) inspectCss(file);
  const code = files.filter((file) => codeExtension.test(file));
  program = ts.createProgram(code, { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, allowJs: true, noEmit: true, skipLibCheck: true });
  checker = program.getTypeChecker();
  for (const file of code) {
    const source = program.getSourceFile(file);
    if (!source) throw new Error(`Cannot inspect ${relative(file)}`);
    sources.set(file, source);
  }
  for (const source of sources.values()) inspectSource(source);
  for (const file of files) {
    if (/\.html?$/i.test(file)) inspectHtml(file);
    else if (inside(src, file) && !codeExtension.test(file) && !styleExtension.test(file)) report(file, 0, 'EC-03', 'Unsupported authored UI input; expose inspectable TS/TSX/JS/JSX/CSS source before adding another source format.');
  }
  for (const [key, location] of [['theme', theme], ['provider', main], ['globalCss', main]]) if (counts[key].length !== 1) report(location, 0, 'EC-02', `Expected exactly one ${key}; found ${counts[key].length}. Keep the canonical theme/entry.`);
  inspectBuild();
  for (const diagnostic of diagnostics.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule))) console[diagnostic.severity === 'error' ? 'error' : 'warn'](`${diagnostic.file}:${diagnostic.line}:${diagnostic.rule}: ${diagnostic.severity.toUpperCase()} ${diagnostic.message}`);
  const errors = diagnostics.filter((item) => item.severity === 'error').length;
  const warnings = diagnostics.length - errors;
  console.log(`UI_CONTRACT_${errors ? 'FAIL' : 'PASS'}: ${sources.size} source files, ${moduleClasses.size} authored stylesheets; ${errors} error(s), ${warnings} manual-review warning(s). Static source compliance only; FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.`);
  process.exitCode = errors ? 1 : 0;
} catch (error) {
  console.error(`editor/scripts/check-ui-contract.mjs:1:EC-07: ERROR Inspection could not complete: ${error.message}`);
  process.exitCode = 1;
}
