# Game Client — project-specific agent guidance

**Canonical owner:** Player input/interaction, presentation integration and the game-selected subset of Runtime execution and content consumption.

Read root agent guidance first.

- [v0.6.12 RV17](../harness/checkpoints/render-viewport-v0.6.12.md): the same
  private continuous browser consumer measures CSS/current DPR and calls Render
  resize/resume before frames. Client owns observers/listeners and explicit
  start/stop/unmount; Render alone owns backend sizing/cleanup. Root remains
  headless-safe; no Editor imports, public API additions or gameplay tick.

- [v0.6.9 RV13/RV14](../harness/checkpoints/render-viewport-v0.6.9.md): optional
  manual-frame-continuous browser entry owns explicit start/stop/rAF cancellation
  and host visibility. It calls only Render public APIs, even when demand is clean.
  Browser lib enabled for private entry compilation; root stays portable and does
  not import it. No game tick, FPS claim, simulation, timing contract or network.
  Compiled only, not browser/visual verified.

- Consume Runtime Engine and Runtime Render via public contracts. Do not replicate game Rules or visual implementation.
- Do not assume MMO, mandatory realtime protocol, client prediction or local authority. Select the model when the actual game is defined.
- Editor is not a runtime dependency. Use exported content independently of Editor process/state.
- A Client may simulate local waves/battles if the game's chosen authority model allows it, but cannot dictate Server policy just by reporting rewards.
- Build-only automated verification, no UI tests or synthetic PASS.
- [v0.8.12 SR19](docs/scene-rendering-v0.8.12.md): optional manual-scene-host owns
  neutral sample inputs/canvas/provider/rAF only, outside the public root. Render
  owns visual instances/resource/cache/backend. No Editor imports/authored formats,
  gameplay tick, protocol or cross-context GPU sharing claim. Build-only evidence.

- v0.8.13 SR20: optional seven-instance manual composition; existing public roots
  only, no production API or schema delta. See the
  [checkpoint](../harness/checkpoints/scene-rendering-v0.8.13.md).
  Source PNG/atlas bytes are original; browser/visual acceptance remains open.

- v0.10.10 SA11: private animation-presentation and manual-animation-host consume
  Render root playback/binding and existing Phase6 host/canonical camera. Client
  owns explicit intent and RAF deltas only; recurring intent never restarts;
  hidden/Pause cancels and requires explicit Start with first delta0. Stop/unmount/
  scene switch is terminal. Package root remains unchanged/headless. No gameplay
  rules, Editor imports, loader/cache implementation or new dependencies. See
  [checkpoint](../harness/checkpoints/sprite-animation-v0.10.10.md).
