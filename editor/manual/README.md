# Manual frame demo — v0.1.7

From workspace root, after README setup with pinned foundations:

```sh
npm run build -- --force
python -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open http://127.0.0.1:4173/editor/manual/ in a browser supporting import maps and
WebGL2. This is a manual product entrypoint, not an automated test or test server.
Stop the local server with Ctrl+C. Do not open the HTML using file://.

Click **Start / new frame**. Expected visual output is a solid opaque blue canvas
(#147da8). The status reports only submission, not successful display or visual
verification. Click **Dispose** to release the Render session. Start again to create
a fresh session on the same host canvas; no old renderer is reused. A retained
blue buffer after disposal is not evidence of an active renderer. Target dimensions
are fixed; no resizing, viewport controls or render loop is implemented.

Missing WebGL2, unsupported target or lost context is a failure, never an empty
successful preview. Text-only content tools can keep using the existing null path
without calling the graphics factory. There is no host-level automatic restore/retry.

The HTML import map resolves the Render **package root** to the artifact declared
by its manifest, and Three to its installed ESM artifact. Editor TS imports only
`@rpg-platform/runtime-render`; it never imports Three or Render-private paths.
No CDN, bundler, UI framework or sixth project is needed. Three is installed only
as a Render dependency (npm may hoist it to workspace node_modules).

Build evidence is not visual evidence. No automated browser execution/assertions,
screenshots, UI tests or frame probes are part of this checkpoint's gates. Record
manual observation separately; absent observation means **VISUAL_NOT_VERIFIED**.

## Manual identity consumer — v0.2.1

After the normal package build, type-check this separate public consumer and run
it manually with the workspace's Node 24.18.0 (native TypeScript stripping):

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-identity.mts
node editor/manual/asset-identity.mts
```

It imports only `@rpg-platform/editor`, prints the frozen detached identity retaining
`sourceId: '0012'` after its host input is changed, separate project/text identities,
case-sensitive IDs and rejected invalid inputs. Name/path fields are host-local
example data, not a metadata descriptor. There are no assertions, test helpers or
automatic test jobs; this is the task's requested manual Node/TypeScript consumer.
No browser, renderer acquisition, filesystem asset access or file rename occurs.
