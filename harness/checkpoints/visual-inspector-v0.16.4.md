# VI05 — v0.16.4

Parent 2bd2c758f56bff7e53c72680876df62e627add7c; inspected VI04 and Render orientation convention.
Editor visual-direction + additive exports only. Validates source and candidate
against explicit captured axes; only orientation changes. Render validates exact
positive-x/toward-positive-y [0,2pi) semantics. No discrete direction mapping,
local rotation, image/frame change, L1/L2 or other owner changes.
DIRECTION_AUTHORED; FRAME_CHANGE_NOT_VERIFIED; UI_NOT_VERIFIED.
Next v0.16.5. Actual gates below.

Observed exit 0: check, scope editor --allow-infra, verify editor --with-consumers; UI checker clean. Existing chunk/DEP0190 warnings.
