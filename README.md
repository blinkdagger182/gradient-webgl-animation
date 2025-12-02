# Premium Fluid Gradient Background

A full-screen animated gradient wave background inspired by the fluid animations on File.ai and Stripe.com. Built with React, WebGL, and GLSL shaders.

## Features

- **Full HD WebGL Canvas** with devicePixelRatio scaling for crisp, retina-ready visuals
- **Simplex Noise-Based Animation** creating organic, flowing wave patterns
- **Moving Origin Point** that drifts smoothly using noise-based and circular motion
- **Multi-Layered Fluid Effects**:
  - Fractal Brownian Motion (FBM) for large-scale flow
  - Turbulent medium-scale noise
  - Fine detail noise overlay
  - Radial waves emanating from origin
  - Angular waves rotating around origin
- **Premium Color Palette** with 5 customizable gradient colors
- **60 FPS Performance** using requestAnimationFrame
- **Responsive Design** with automatic window resize handling

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000/`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── index.html          # HTML entry point
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Main React component
│   ├── style.css       # Global styles
│   ├── webgl.js        # WebGL initialization and animation loop
│   └── shaders.js      # Vertex and fragment GLSL shaders
├── package.json
└── vite.config.js
```

## Customization

### Changing Colors

Edit the color constants at the top of the fragment shader in `src/shaders.js`:

```glsl
// ===== CUSTOMIZABLE COLORS =====
const vec3 color1 = vec3(0.05, 0.02, 0.15);   // Deep purple-black
const vec3 color2 = vec3(0.35, 0.15, 0.65);   // Rich purple
const vec3 color3 = vec3(0.15, 0.45, 0.85);   // Bright blue
const vec3 color4 = vec3(0.85, 0.25, 0.55);   // Hot pink
const vec3 color5 = vec3(0.95, 0.75, 0.35);   // Golden yellow
```

Colors are in RGB format with values from 0.0 to 1.0.

### Animation Speed

Adjust the time multipliers in `src/shaders.js`:

```glsl
float slowTime = u_time * 0.15;   // Large-scale flow
float medTime = u_time * 0.25;    // Medium turbulence
float fastTime = u_time * 0.4;    // Fine details
```

### Origin Movement

Modify the drift parameters in `src/webgl.js`:

```javascript
const driftSpeed = 0.15;  // Speed of noise-based drift
const marginX = canvas.width * 0.15;  // Movement boundaries
```

## Technical Details

### WebGL Shader Pipeline

1. **Vertex Shader**: Simple pass-through for full-screen quad
2. **Fragment Shader**: Complex noise-based gradient generation
   - Simplex noise implementation
   - Fractal Brownian Motion (5 octaves)
   - Multi-layer wave composition
   - Distance-based color mixing
   - Origin-centered effects

### Animation System

- **Noise-based drift**: Smooth random movement using 1D noise
- **Circular motion**: Layered elliptical paths for organic feel
- **Smooth interpolation**: Gradual transitions between positions
- **60 FPS target**: Optimized shader performance

### Performance Optimizations

- DevicePixelRatio capped at 2x to balance quality and performance
- Efficient noise calculations
- Minimal uniform updates
- Single draw call per frame

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires WebGL support.

## License

MIT

## Inspiration

Visual style inspired by:
- File.ai's fluid gradient backgrounds
- Stripe.com's animated gradient effects
- Modern premium web design aesthetics
