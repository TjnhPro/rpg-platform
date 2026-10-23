# Client Scene manual host — v0.8.12

Status: **compiled only; browser NOT_EXECUTED**. No automated test/assertion.

Run `npm run build -- --force`, serve the workspace over HTTP (for example
`python -m http.server 8080` at the workspace root), and open
`http://localhost:8080/game-client/manual/scene.html`. Select an authorized PNG up to
1 MiB, then Open. The page imports Client's compiled owner-private browser module
and Render root; it has no Editor imports. Canvas and explicit projection are 320x240.
The immutable File belongs to one provider scope/revision per one-shot mount.

Manual observations to record, not already observed:

1. Record initial two opaque instance handles, session symbol and real Phase7
   usable resource/cache observations. Inspect visible pixels separately from frame
   receipts. Add another neutral instance through the Add control.
2. Move/hide/show/order first: record same handle/visual key, changed presentation
   and successful next submission. These are sample visuals, not gameplay movement.
3. Remove second: record other members still drawable. The retained host lease
   deliberately keeps resource residency for later Add; do not infer eviction from
   last instance removal. Close drains scene rights and host lease/cache/session.
4. Close while PNG load is pending; observe no late scene adoption/frame request.
   Reload for a fresh mount; no automatic retries/reacquisition are supported.

For independent Editor/Client observation, compile the existing Editor consumer:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir editor/manual --outDir .artifacts/scene-preview editor/manual/scene-preview.mts
```

Open `http://localhost:8080/harness/manual/scene-hosts.html`. One selected authorized
PNG feeds two separate exact-scope providers. Open both; record distinct canvases,
both actual frame receipts and `differentSessionIds: true` from strict symbol
comparison after both hosts are live. Editor projects three shared references plus
a missing reference; Client uses neutral samples without authored Scene types.
The same root URL is used by both; there is no GPU sharing claim across contexts.

Move/remove in one host and observe the other unchanged. Close Editor, then Draw/
modify Client; repeat with Client closed and Editor still active after page reload.
Record real pixels and cleanup diagnostics. Failed opens are independent allSettled
outcomes, not success or placeholder acceptance. A disposed Editor is no longer
inspected through active-membership APIs. Selection cannot replace a live mount;
reload instead. Pagehide closes adopted hosts; late Editor factory results release.

No atlas/TPSheet display, native loss, GPU memory, async cleanup, alpha correctness
or independence has been behaviorally verified here. Static/compile results and
expected procedures are not visual PASS or whole-phase acceptance.
