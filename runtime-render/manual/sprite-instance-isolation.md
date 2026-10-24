# Manual multi-instance playback host — SA09

Source: [sprite-instance-isolation.mts](sprite-instance-isolation.mts), a public
Render-root consumer with no DOM requirement. It is optional tooling, not a
production actor manager or a test. It does not acquire resources, create Scenes,
schedule frames, implement animation transitions or mirror Scene membership.

Prepare two compatible existing Phase8 instances in one live Scene using the
normal transform API, one canonical immutable eight-way clip, canonical atlas/
revision/page attestation, verified per-frame origin data and a Phase7 cache.
Acquire one host lease for each actor using the same descriptor/revision/options
and session. Call mountManualSpriteActor separately with these inputs and the
same clips array. frameInput receives the current selected reference and must
return the corresponding authored alignment and current atlas/source revision.
It must not infer ground from missing trim or use a fabricated frame address.

On successful setup the example owns the passed instance and lease. A caller
handling setup exceptions still owns them. Handle each actor.ready promise;
known pending/unavailable outcomes return canonical binding rejection, while
unexpected exceptions reject. close is required on failure/unmount. The example
never disposes the borrowed session, Scene or cache; their caller drains them
after all its actor hosts have closed.

Optional isolated compile, after building Render:

```json
{
  "compilerOptions": {
    "module": "NodeNext", "target": "ES2022", "strict": true,
    "skipLibCheck": false, "types": [], "lib": ["ES2022"],
    "rootDir": "../runtime-render/manual", "outDir": "./sa09-manual"
  },
  "files": ["../runtime-render/manual/sprite-instance-isolation.mts"]
}
```

Save this as .artifacts/sa09-manual-tsconfig.json and run
`npx tsc -p .artifacts/sa09-manual-tsconfig.json`. For a native-module browser host,
serve the emitted example, map @rpg-platform/runtime-render to the built Render
root, and map three as in existing manual pages. Supply actual selected assets
through the public provider/cache rather than embedding/copying proprietary art.
This consumer is host composition and intentionally requires the prepared inputs
above; compilation alone does not load assets or prove runtime behavior.

Observe manually, without assertions or an automatic suite:

1. Await both ready promises. Play both; advance A50ms and pause it, advance B175ms
   with a125ms two-frame clip. Select different explicit directions, sync each and
   draw the existing session. Inspect different elapsed/frame/state and shared
   resourceId/sessionId, then separately inspect actual sprite pixels.
2. Hide A and advance each explicitly. A's pause remains its own policy; hidden
   playing actors can still advance when the host supplies delta. Select another
   declared clip on A and confirm B's snapshot is unchanged.
3. close A twice. Advance/sync/draw B and inspect its valid lease. close B and
   inspect final rights; a page still used by another session may remain on CPU.
4. With a deliberately delayed real provider, remove a pending instance through
   Phase8 and reuse its ID. Deliver the original resource result: old ready must
   reject binding, and the new registration must remain unbound. Close the old
   host to release its still-owned lease. Also close before readiness to exercise
   the host latch; no late callback may recreate membership.
5. Mount independently in another graphics session using the same clip. Dispose
   one session while the other advances/syncs/draws. Native context loss can be
   triggered manually through that canvas's WEBGL_lose_context extension if
   available; it must close that session only. Never synthesize a success receipt.
6. Drain all hosts, Scenes, leases, sessions and cache; record exact diagnostics,
   exceptions and nonobservations. Zero counters are not native-memory proof.

The actual finite observations, source hashes and limitations are recorded in
the [SA09 checkpoint](../../harness/checkpoints/sprite-animation-v0.10.8.md).
