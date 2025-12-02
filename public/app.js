// Vertex Shader
const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Fragment Shader
const fragmentShaderSource = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_origin;

  // ===== COLORS =====
  const vec3 bgColor = vec3(1.0);
  const vec3 color1 = vec3(0.4, 0.7, 1.0);   // Light blue
  const vec3 color2 = vec3(0.6, 0.4, 1.0);   // Purple
  const vec3 color3 = vec3(1.0, 0.5, 0.7);   // Pink
  const vec3 color4 = vec3(0.5, 0.9, 0.8);   // Cyan
  // ==================

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 pos = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
    vec2 originNorm = (u_origin - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // Create flowing line across screen
    vec2 toOrigin = pos - originNorm;
    float dist = length(toOrigin);
    
    // Flowing noise for organic movement
    vec2 flowPos = pos + vec2(u_time * 0.05, 0.0);
    
    vec2 q = vec2(
      fbm(flowPos * 1.5 + vec2(u_time * 0.02, 0.0)),
      fbm(flowPos * 1.5 + vec2(5.2, 1.3))
    );
    
    vec2 r = vec2(
      fbm(flowPos * 1.2 + q * 0.5 + vec2(u_time * 0.015, 0.0)),
      fbm(flowPos * 1.2 + q * 0.5 + vec2(8.3, 2.8))
    );
    
    float f = fbm(flowPos * 1.0 + r * 0.4);
    
    // Create vertical wave line with noise distortion
    float linePos = pos.x + sin(pos.y * 3.0 + u_time * 0.1) * 0.15;
    linePos += q.x * 0.2 + r.x * 0.15;
    
    // Distance from the flowing line
    float lineDist = abs(linePos);
    
    // Create lava lamp blob effect along the line
    float blob = sin(pos.y * 4.0 - u_time * 0.15 + f * 3.0) * 0.5 + 0.5;
    blob = pow(blob, 2.0);
    
    // Narrow line width with soft edges
    float lineWidth = 0.15 + blob * 0.1;
    float line = smoothstep(lineWidth, lineWidth * 0.3, lineDist);
    line = 1.0 - line;
    
    // Add variation along the line
    float variation = fbm(vec2(pos.y * 2.0 + u_time * 0.02, 0.0));
    line *= 0.7 + variation * 0.3;
    
    // Color mixing based on position along line
    vec3 color = mix(color1, color2, smoothstep(-0.5, 0.5, sin(pos.y * 2.0 + u_time * 0.1)));
    color = mix(color, color3, smoothstep(-0.5, 0.5, q.x + blob));
    color = mix(color, color4, smoothstep(-0.5, 0.5, r.x));
    
    // Apply line intensity
    float intensity = line * (0.6 + blob * 0.4);
    
    // Blend with white background
    vec3 finalColor = mix(bgColor, color, intensity * 0.5);
    
    // Soft edges
    finalColor = mix(bgColor, finalColor, smoothstep(0.0, 0.3, intensity));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

function noise1D(x) {
  const X = Math.floor(x) & 255;
  x -= Math.floor(x);
  const u = x * x * (3.0 - 2.0 * x);
  const a = Math.sin(X * 12.9898 + 78.233) * 43758.5453;
  const b = Math.sin((X + 1) * 12.9898 + 78.233) * 43758.5453;
  return (a - Math.floor(a)) * (1.0 - u) + (b - Math.floor(b)) * u;
}

function init() {
  const canvas = document.getElementById('gradient-canvas');
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance'
  });
  
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);
  
  if (!program) return;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const originLocation = gl.getUniformLocation(program, 'u_origin');

  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;
  let noiseOffsetX = Math.random() * 1000;
  let noiseOffsetY = Math.random() * 1000;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  let startTime = Date.now();
  
  function render() {
    const currentTime = (Date.now() - startTime) / 1000;
    
    // Position origin off-screen to the left
    const driftSpeed = 0.02;
    const noiseY = noise1D(noiseOffsetY + currentTime * driftSpeed);
    
    // Keep X off-screen to the left
    const baseX = -canvas.width * 0.3;
    
    // Y drifts vertically
    const marginY = canvas.height * 0.2;
    const targetY = marginY + noiseY * (canvas.height - 2 * marginY);
    
    originX = baseX;
    originY += (targetY - originY) * 0.003;
    
    // Gentle vertical oscillation
    const orbit1Y = Math.sin(currentTime * 0.08) * 100;
    const orbit2Y = Math.sin(currentTime * 0.05 + 3.14) * 70;
    
    const finalOriginX = originX;
    const finalOriginY = originY + orbit1Y + orbit2Y;

    gl.useProgram(program);
    
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(originLocation, finalOriginX, finalOriginY);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    requestAnimationFrame(render);
  }

  resize();
  window.addEventListener('resize', resize);
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
