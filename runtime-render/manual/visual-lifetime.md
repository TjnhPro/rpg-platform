# v0.8.10 optional manual resource lifetime walkthrough

Browser NOT_EXECUTED; no behavioral/visual/leak-free acceptance from compilation.

From workspace root:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-lifetime runtime-render/manual/visual-lifetime.mts runtime-render/manual/visual-instance-depth.mts runtime-render/manual/visual-instance-ordering.mts runtime-render/manual/visual-instance-visibility.mts runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/runtime-render/manual/visual-lifetime.html` manually.
Select an authorized PNG (up to1MiB/2048 each dimension/4M pixels); Load both
sessions. Both scopes use two independently retained usages of their own shared
native allocation. Two canonical sessions/renderers are intentional host instances,
not an alternate rendering implementation. CSS size does not alter scene units.

1. Observe initial logical counts2/2/2 for each scope. This is expected, not observed.
2. Bind released lease: inspect safe RESOURCE_NOT_USABLE rejection and unchanged
   counts. null would be unexpected successful admission, not a hidden PASS.
3. Remove first A item; Draw A. Directly inspect surviving A item; counts should
   show one binding. Repeat removal: false, without another release attempt.
4. Dispose A scene twice. Observe terminal/zero counts and stable releaseAttempts;
   Draw A should still submit its empty clear because the borrowed session lives.
   Draw B should still submit its two sprites; visually inspect B separately.
5. Dispose A session twice. Draw A should reject through canonical session
   diagnostics; Draw B should remain usable. No session/scope revival is offered.
6. Close both, Observe. Count zero and a submitted receipt do not prove GPU memory
   reclamation, displayed pixels, cleanup success or long-running leak freedom.

For actual context loss/late IO failure, use the existing Phase6/7 manual policy
and record environment, action, safe diagnostics and independent pixel observations.
No synthetic event, fake lease or automated destructive/context-loss assertion is
included. Unknown host/native errors remain UNKNOWN_FAILURE; inspect canonical
session/cache state without treating unknown as clean. Stop the local server after
review. Filenames/bytes stay local; the page has no upload/persistence endpoint.
