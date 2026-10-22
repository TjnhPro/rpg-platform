# Game Client — project-specific agent guidance

**Canonical owner:** Player input/interaction, presentation integration and the game-selected subset of Runtime execution and content consumption.

Read root agent guidance first.

- Consume Runtime Engine and Runtime Render via public contracts. Do not replicate game Rules or visual implementation.
- Do not assume MMO, mandatory realtime protocol, client prediction or local authority. Select the model when the actual game is defined.
- Editor is not a runtime dependency. Use exported content independently of Editor process/state.
- A Client may simulate local waves/battles if the game's chosen authority model allows it, but cannot dictate Server policy just by reporting rewards.
- Build-only automated verification, no UI tests or synthetic PASS.
