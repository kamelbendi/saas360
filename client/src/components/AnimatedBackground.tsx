import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';

// Interactive grid background with mouse interaction
const AnimatedBackground = () => {
  const { camera } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  
  // Create grid points
  const { positions, colors, sizes } = useMemo(() => {
    const gridSize = 20;
    const spacing = 2;
    const count = gridSize * gridSize;
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const xi = x * 3 + i * 3;
        
        // Position in a grid pattern
        positions[xi] = (x - gridSize / 2) * spacing;
        positions[xi + 1] = -2; // Just below ground level
        positions[xi + 2] = (z - gridSize / 2) * spacing;
        
        // Base color: blue-ish
        colors[xi] = 0.1;
        colors[xi + 1] = 0.3;
        colors[xi + 2] = 0.8;
        
        // Size
        sizes[i] = 0.3;
        
        i++;
      }
    }
    
    return { positions, colors, sizes };
  }, []);
  
  // Animate points
  useFrame(({ clock, pointer, viewport }) => {
    if (!pointsRef.current) return;
    
    // Update raycaster with current mouse position
    mouse.x = (pointer.x * viewport.width) / 2;
    mouse.y = (pointer.y * viewport.height) / 2;
    
    raycaster.setFromCamera(pointer, camera);
    
    // Get attributes
    const positionAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = pointsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
    const sizeAttr = pointsRef.current.geometry.getAttribute('size') as THREE.BufferAttribute;
    
    // Time-based animation
    const time = clock.getElapsedTime();
    
    // Animate each point
    for (let i = 0; i < positionAttr.count; i++) {
      const i3 = i * 3;
      
      // Get current position
      const x = positionAttr.array[i3];
      const y = positionAttr.array[i3 + 1];
      const z = positionAttr.array[i3 + 2];
      
      // Calculate distance to mouse ray
      const point = new THREE.Vector3(x, y, z);
      const rayPointDistance = raycaster.ray.distanceToPoint(point);
      const isNearMouse = rayPointDistance < 5;
      
      // Wave animation with time and position
      const wave = Math.sin(time * 2 + x * 0.5 + z * 0.5) * 0.1;
      
      // Update y position with wave
      positionAttr.array[i3 + 1] = -2 + wave;
      
      // Update color - brighter when near mouse
      if (isNearMouse) {
        const intensity = 1 - rayPointDistance / 5;
        colorAttr.array[i3] = 0.4 + intensity * 0.6; // Red
        colorAttr.array[i3 + 1] = 0.5 + intensity * 0.5; // Green
        colorAttr.array[i3 + 2] = 1.0; // Blue
        
        // Larger size when near mouse
        sizeAttr.array[i] = 0.5 + intensity * 0.5;
      } else {
        // Default color animation
        const colorWave = Math.sin(time + x * 0.2 + z * 0.2) * 0.05 + 0.05;
        colorAttr.array[i3] = 0.1 + colorWave;
        colorAttr.array[i3 + 1] = 0.3 + colorWave;
        colorAttr.array[i3 + 2] = 0.8 + colorWave;
        
        // Default size with subtle animation
        sizeAttr.array[i] = 0.3 + Math.sin(time * 3 + i * 0.2) * 0.05;
      }
    }
    
    // Mark attributes for update
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });
  
  // Create particle material
  const particleMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a radial gradient
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.25, 'rgba(200, 220, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.PointsMaterial({
      size: 1,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
  }, []);
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={particleMaterial} />
    </points>
  );
};

export default AnimatedBackground;