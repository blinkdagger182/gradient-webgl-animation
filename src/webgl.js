import { vertexShader, fragmentShader } from './shaders';

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

export function initWebGL(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance'
  });
  
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  // Compile shaders
  const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = createProgram(gl, vShader, fShader);
  
  if (!program) return;

  // Set up geometry (full-screen quad)
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const originLocation = gl.getUniformLocation(program, 'u_origin');

  // Origin point animation state with noise-based drift
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;
  let noiseOffsetX = Math.random() * 1000;
  let noiseOffsetY = Math.random() * 1000;

  // Simple noise function for smooth random movement
  function noise(x) {
    const X = Math.floor(x) & 255;
    x -= Math.floor(x);
    const u = x * x * (3.0 - 2.0 * x);
    const a = Math.sin(X * 12.9898 + 78.233) * 43758.5453;
    const b = Math.sin((X + 1) * 12.9898 + 78.233) * 43758.5453;
    return (a - Math.floor(a)) * (1.0 - u) + (b - Math.floor(b)) * u;
  }

  // Resize handler with HD support
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Animation loop
  let animationId;
  let startTime = Date.now();
  
  function render() {
    const currentTime = (Date.now() - startTime) / 1000;
    
    // Noise-based smooth drift
    const noiseScale = 0.3;
    const driftSpeed = 0.15;
    
    const noiseX = noise(noiseOffsetX + currentTime * driftSpeed);
    const noiseY = noise(noiseOffsetY + currentTime * driftSpeed);
    
    // Map noise to screen space with margins
    const marginX = canvas.width * 0.15;
    const marginY = canvas.height * 0.15;
    
    const targetX = marginX + noiseX * (canvas.width - 2 * marginX);
    const targetY = marginY + noiseY * (canvas.height - 2 * marginY);
    
    // Smooth interpolation
    originX += (targetX - originX) * 0.015;
    originY += (targetY - originY) * 0.015;
    
    // Add layered circular/elliptical motion
    const circle1X = Math.cos(currentTime * 0.4) * 120;
    const circle1Y = Math.sin(currentTime * 0.4) * 80;
    
    const circle2X = Math.cos(currentTime * 0.25 + 1.5) * 60;
    const circle2Y = Math.sin(currentTime * 0.35 + 1.5) * 90;
    
    // Combine all movements
    const finalOriginX = originX + circle1X + circle2X;
    const finalOriginY = originY + circle1Y + circle2Y;

    gl.useProgram(program);
    
    // Set uniforms
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(originLocation, finalOriginX, finalOriginY);
    
    // Set up attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    animationId = requestAnimationFrame(render);
  }

  // Initialize
  resize();
  window.addEventListener('resize', resize);
  render();

  // Cleanup function
  return () => {
    window.removeEventListener('resize', resize);
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    gl.deleteProgram(program);
    gl.deleteShader(vShader);
    gl.deleteShader(fShader);
    gl.deleteBuffer(positionBuffer);
  };
}
