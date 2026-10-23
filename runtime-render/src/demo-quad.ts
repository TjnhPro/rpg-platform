import { FrameError } from './frame-failure.js';

/** Private single-quad helper inside the existing backend/context, not another renderer. */
export function createDemoQuad(gl: WebGL2RenderingContext) {
  let program: WebGLProgram | null = null, vao: WebGLVertexArrayObject | null = null;
  const shaders: WebGLShader[] = [];
  const dispose = (): void => {
    const ownedProgram = program, ownedVao = vao;
    program = null; vao = null;
    let failed = false;
    for (const action of [() => gl.deleteProgram(ownedProgram), () => gl.deleteVertexArray(ownedVao),
      ...shaders.splice(0).map(shader => () => gl.deleteShader(shader))]) {
      try { action(); } catch { failed = true; }
    }
    if (gl.getError() !== gl.NO_ERROR && !gl.isContextLost()) failed = true;
    if (failed) throw new FrameError('CLEANUP_FAILED', 'dispose', true);
  };
  try {
    program = gl.createProgram(); vao = gl.createVertexArray();
    if (!program || !vao) throw new FrameError('FRAME_FAILED', 'renderFrame');
    for (const [type, source] of [
      [gl.VERTEX_SHADER, `#version 300 es
        precision highp float;
        uniform vec4 bounds; out vec2 uv;
        void main() {
          vec2 p = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
          gl_Position = vec4(p * 1.6 - 0.8, 0.0, 1.0);
          uv = mix(bounds.xy, bounds.zw, vec2(p.x, 1.0-p.y));
        }`],
      [gl.FRAGMENT_SHADER, `#version 300 es
        precision highp float;
        uniform sampler2D image; in vec2 uv; out vec4 pixel;
        void main() {
          vec4 c = texture(image, uv);
          vec3 encoded = mix(c.rgb * 12.92, 1.055 * pow(max(c.rgb, vec3(0.0)), vec3(1.0/2.4)) - 0.055,
            step(vec3(0.0031308), c.rgb));
          pixel = vec4(encoded, c.a);
        }`],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new FrameError('FRAME_FAILED', 'renderFrame');
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new FrameError('FRAME_FAILED', 'renderFrame');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new FrameError('FRAME_FAILED', 'renderFrame');
    const bounds = gl.getUniformLocation(program, 'bounds'), image = gl.getUniformLocation(program, 'image');
    if (bounds === null || image === null) throw new FrameError('FRAME_FAILED', 'renderFrame');
    return Object.freeze({ dispose, draw(texture: WebGLTexture, uv: readonly [number, number, number, number]) {
      if (!program || !vao) throw new FrameError('FRAME_FAILED', 'renderFrame');
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindVertexArray(vao); gl.useProgram(program);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST);
      gl.colorMask(true, true, true, true); gl.enable(gl.BLEND);
      gl.blendEquation(gl.FUNC_ADD); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.bindSampler(0, null);
      gl.uniform1i(image, 0); gl.uniform4f(bounds, ...uv); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindTexture(gl.TEXTURE_2D, null); gl.bindVertexArray(null); gl.useProgram(null);
    } });
  } catch (error) {
    try { dispose(); } catch { throw new FrameError('CLEANUP_FAILED', 'renderFrame', true); }
    throw error;
  }
}
