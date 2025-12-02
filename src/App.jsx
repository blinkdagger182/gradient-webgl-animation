import React, { useEffect, useRef } from 'react';
import { initWebGL } from './webgl';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = initWebGL(canvas);

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}

export default App;
