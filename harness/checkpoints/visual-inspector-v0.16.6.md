# VI07 — v0.16.6

Parent 1c6f7b5c82ba2e763e50e3a5dac0a67f19b06dbd; inspected VI06 and actual Render PlanarTransform2D.
Editor visual-scale + additive exports. Focused immutable profile candidate,
finite dimensionless X/Y via existing profile/Render factory. Zero/negative
accepted, no clamp/resizing/aspect formula. Scene placement and other fields
untouched. No local translation/rotation persistence or cross-owner delta.
UI_NOT_VERIFIED; next v0.16.7. Actual commands below; no L1/L2 use.

Observed exit 0: check, scope editor --allow-infra, verify editor --with-consumers; UI checker clean. Existing chunk/DEP0190 warnings.
