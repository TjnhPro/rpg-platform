# VI04 — v0.16.3

Parent da78157643b0f9f31cbb170c2fd03d6f3279349f; audited VI03 and current Scene/Spatial signatures.
Editor visual-position module + additive root. Read distinguishes absence/null;
edit delegates createSpatialPoint2D/updateSceneObjectSpatialPlacement including
exact project/space guards. Returns candidate only; metadata stays at Document
edit seam. No snapping, coordinate math, Render or L1/L2 change. No UI yet.
Next v0.16.4; actual gates below. Functional/visual behavior not verified.

Observed exit 0: check, scope editor --allow-infra, verify editor --with-consumers. UI checker clean; Vite chunk/DEP0190 warnings retained. UI_NOT_VERIFIED.
