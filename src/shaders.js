export const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_origin;

  // ===== CUSTOMIZABLE COLORS =====
  // Change these to customize the gradient palette
  const vec3 color1 = vec3(0.05, 0.02, 0.15);   // Deep purple-black
  const vec3 color2 = vec3(0.35, 0.15, 0.65);   // Rich purple
  const vec3 color3 = vec3(0.15, 0.45, 0.85);   // Bright blue
  const vec3 color4 = vec3(0.85, 0.25, 0.55);   // Hot pink
  const vec3 color5 = vec3(0.95, 0.75, 0.35);   // Golden yellow
  // ================================

  // Simplex noise implementation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion for complex noise
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 pos = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // Normalize origin to same coordinate space
    vec2 originNorm = (u_origin - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // Distance and angle from moving origin
    vec2 toOrigin = pos - originNorm;
    float dist = length(toOrigin);
    float angle = atan(toOrigin.y, toOrigin.x);
    
    // Time-based animation speeds
    float slowTime = u_time * 0.15;
    float medTime = u_time * 0.25;
    float fastTime = u_time * 0.4;
    
    // Layer 1: Large-scale flowing noise
    vec2 flow1 = vec2(
      fbm(pos * 1.5 + vec2(slowTime, -slowTime * 0.7)),
      fbm(pos * 1.5 + vec2(-slowTime * 0.8, slowTime))
    );
    
    // Layer 2: Medium-scale turbulence
    vec2 flow2 = vec2(
      snoise(pos * 3.0 + flow1 * 0.5 + medTime),
      snoise(pos * 3.0 + flow1 * 0.5 - medTime * 0.6)
    );
    
    // Layer 3: Fine detail noise
    float detail = snoise(pos * 8.0 + flow2 * 0.3 + fastTime);
    
    // Radial waves emanating from origin
    float radialWave = sin(dist * 8.0 - u_time * 1.5 + flow1.x * 2.0) * 0.5 + 0.5;
    radialWave *= exp(-dist * 0.8);
    
    // Angular waves around origin
    float angularWave = sin(angle * 4.0 + u_time * 0.8 + flow2.y * 3.0) * 0.5 + 0.5;
    angularWave *= exp(-dist * 1.2);
    
    // Combine all noise layers
    float combinedNoise = flow1.x * 0.4 + flow2.y * 0.3 + detail * 0.3;
    
    // Create fluid field value
    float field = combinedNoise + radialWave * 0.6 + angularWave * 0.4;
    
    // Distance-based gradient
    float distGradient = 1.0 - smoothstep(0.0, 1.5, dist);
    
    // Multiple color mixing zones
    float zone1 = smoothstep(-0.8, 0.2, field);
    float zone2 = smoothstep(-0.3, 0.6, field + dist * 0.5);
    float zone3 = smoothstep(0.0, 1.0, field - dist * 0.3);
    float zone4 = smoothstep(0.3, 1.2, radialWave + angularWave);
    
    // Base gradient from dark to bright
    vec3 color = mix(color1, color2, zone1);
    
    // Add blue tones
    color = mix(color, color3, zone2 * 0.7);
    
    // Add pink highlights
    color = mix(color, color4, zone3 * zone4 * 0.6);
    
    // Add golden glow near origin
    float originGlow = exp(-dist * 1.5) * (0.5 + radialWave * 0.5);
    color = mix(color, color5, originGlow * 0.4);
    
    // Add bright highlights on wave peaks
    float highlight = smoothstep(0.7, 1.0, radialWave) * exp(-dist * 2.0);
    color += color3 * highlight * 0.5;
    
    // Subtle vignette for depth
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(pos));
    color *= 0.7 + vignette * 0.3;
    
    // Enhance contrast
    color = pow(color, vec3(0.9));
    color = smoothstep(0.0, 1.0, color);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
