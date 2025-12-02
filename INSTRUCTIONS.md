# Fluid Gradient Wave Background - Instructions

## Quick Start

### Option 1: Using Vite Dev Server (Recommended)

```bash
npm run serve
```

This will automatically open your browser to `http://localhost:5173/`

### Option 2: Using Any HTTP Server

```bash
# Using Python 3
cd public
python3 -m http.server 8000

# Using Node.js http-server (install globally first: npm i -g http-server)
cd public
http-server -p 8000 -o

# Using PHP
cd public
php -S localhost:8000
```

Then open `http://localhost:8000/` in your browser.

## Project Structure

```
public/
├── index.html      # Main HTML file
├── styles.css      # Minimal CSS for full-screen canvas
└── app.js          # Complete WebGL implementation with shaders
```

## Customization

### Change Colors

Edit the color constants in `public/app.js` (inside the fragment shader):

```javascript
const vec3 color1 = vec3(0.02, 0.01, 0.08);  // Deep dark base
const vec3 color2 = vec3(0.18, 0.08, 0.35);  // Dark purple
const vec3 color3 = vec3(0.35, 0.15, 0.65);  // Rich purple
const vec3 color4 = vec3(0.12, 0.35, 0.75);  // Bright blue
const vec3 color5 = vec3(0.65, 0.18, 0.45);  // Magenta
const vec3 color6 = vec3(0.85, 0.45, 0.25);  // Orange glow
```

RGB values range from 0.0 to 1.0.

### Adjust Animation Speed

Modify the time multipliers in the fragment shader:

```javascript
float t1 = u_time * 0.08;   // Slow warp
float t2 = u_time * 0.12;   // Medium warp
float t3 = u_time * 0.18;   // Fast detail
```

Lower values = slower animation.

### Change Origin Movement

In the `render()` function:

```javascript
const driftSpeed = 0.08;     // Noise-based drift speed
const marginX = canvas.width * 0.2;  // Movement boundaries

// Orbital motion speeds
const orbit1X = Math.cos(currentTime * 0.25) * 150;  // Large orbit
const orbit2X = Math.cos(currentTime * 0.15 + 2.0) * 80;  // Small orbit
```

## Features

- **Pure WebGL** - No frameworks, maximum performance
- **Simplex Noise** - Organic, flowing patterns
- **Fractal Brownian Motion** - 6 octaves for complex detail
- **Multi-layered Waves** - Radial, angular, and combined wave patterns
- **Smooth Origin Drift** - Noise-based + orbital motion
- **HD Support** - DevicePixelRatio scaling up to 2x
- **Auto-resize** - Responsive to window changes
- **60 FPS** - Optimized shader performance

## Browser Requirements

- WebGL support (Chrome 90+, Firefox 88+, Safari 14+)
- Modern JavaScript (ES6+)

## Performance Notes

- DevicePixelRatio is capped at 2x for optimal performance
- 6 octaves of FBM provide rich detail without excessive computation
- Single draw call per frame
- Efficient noise implementation

## Visual Style

This implementation recreates the premium fluid gradient aesthetic seen on:
- Stripe.com's animated backgrounds
- File.ai's moving gradient waves
- Modern SaaS landing pages

The effect features:
- Slow, elegant motion
- Smooth color transitions
- Organic liquid-like flow
- High-contrast premium colors
- Subtle glow and highlights
