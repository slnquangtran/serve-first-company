/* Serve First: Company. WebGL background: flowing noise whose colour follows team trust.
   Low trust drifts toward burgundy, high trust toward teal. Falls back to the CSS gradient. */
const BG = (() => {
  const canvas = document.getElementById('bg');
  const gl = canvas && canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return { setMood() {} };

  const VERT = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
  const FRAG = `precision mediump float;
    uniform vec2 res; uniform float t; uniform float trust; uniform vec2 mouse;
    float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.02; a *= 0.5; } return v; }
    void main() {
      vec2 uv = gl_FragCoord.xy / res; vec2 p = uv * vec2(res.x / res.y, 1.0) * 2.2;
      p += (mouse - 0.5) * 0.25;
      float q = fbm(p + vec2(t * 0.03, -t * 0.02));
      float r = fbm(p * 1.4 + q * 2.0 + vec2(-t * 0.02, t * 0.025));
      vec3 base = vec3(0.071, 0.031, 0.043);
      vec3 warm = vec3(0.48, 0.08, 0.15);
      vec3 cool = vec3(0.06, 0.34, 0.30);
      vec3 gold = vec3(0.88, 0.72, 0.37);
      vec3 tint = mix(warm, cool, trust);
      vec3 col = mix(base, tint, smoothstep(0.35, 0.95, r) * 0.75);
      col += gold * pow(smoothstep(0.62, 1.0, q * r * 1.6), 3.0) * 0.18;
      col *= 1.0 - 0.55 * length(uv - 0.5);
      col += (h(gl_FragCoord.xy + t) - 0.5) * 0.025;
      gl_FragColor = vec4(col, 1.0);
    }`;

  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return { setMood() {} };
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = name => gl.getUniformLocation(prog, name);
  const uRes = u('res'), uT = u('t'), uTrust = u('trust'), uMouse = u('mouse');

  const SCALE = 0.5; // render at half resolution: the image is soft anyway
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let trust = 0.5, target = 0.5, mx = 0.5, my = 0.5;
  const t0 = performance.now();
  function resize() {
    canvas.width = Math.max(1, innerWidth * SCALE);
    canvas.height = Math.max(1, innerHeight * SCALE);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  function frame(now) {
    trust += (target - trust) * 0.03;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, reduced ? 0 : (now - t0) / 1000);
    gl.uniform1f(uTrust, trust);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduced && !document.hidden) requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { resize(); if (reduced) frame(0); });
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduced) requestAnimationFrame(frame); });
  resize();
  canvas.classList.add('on');
  requestAnimationFrame(frame);

  return { setMood(v) { target = Math.max(0, Math.min(1, v)); if (reduced) { trust = target; frame(0); } } };
})();
