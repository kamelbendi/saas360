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
  
  // Create scattered points (not in a grid) at a distance below the moon
  const { positions, colors, sizes } = useMemo(() => {
    const particleCount = 100;
    const radius = 55; // Slightly larger than moon radius to be below surface
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Generate random points in a hemisphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2 + Math.PI / 2; // Bottom hemisphere
      const r = radius;
      
      // Convert to Cartesian coordinates
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi) - 50; // Offset by moon center position
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      
      // Use white/silver colors instead of blue
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness;
      
      // Vary sizes
      sizes[i] = 0.1 + Math.random() * 0.2;
    }
    
    return { positions, colors, sizes };
  }, []);
  
  // Create initial positions with animation
  const particlePositions = useMemo(() => {
    // Create a copy of positions that won't change
    return new Float32Array(positions);
  }, [positions]);
  
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
      
      // Get stored initial position
      const originalX = particlePositions[i3];
      const originalY = particlePositions[i3 + 1];
      const originalZ = particlePositions[i3 + 2];
      
      // Add gentle motion - slight twinkle and drift
      const verticalWave = Math.sin(time * 0.5 + i * 0.2) * 0.2;
      positionAttr.array[i3] = originalX;
      positionAttr.array[i3 + 1] = originalY + verticalWave;
      positionAttr.array[i3 + 2] = originalZ;
      
      // Get current updated position
      const x = positionAttr.array[i3];
      const y = positionAttr.array[i3 + 1];
      const z = positionAttr.array[i3 + 2];
      
      // Calculate distance to mouse ray
      const point = new THREE.Vector3(x, y, z);
      const rayPointDistance = raycaster.ray.distanceToPoint(point);
      const isNearMouse = rayPointDistance < 5;
      
      // Update color - twinkle effect
      if (isNearMouse) {
        // Brighten when mouse is near
        const intensity = 1 - rayPointDistance / 5;
        const glow = 0.7 + intensity * 0.3;
        colorAttr.array[i3] = glow;     // White-silver glow
        colorAttr.array[i3 + 1] = glow;
        colorAttr.array[i3 + 2] = glow;
        
        // Larger size when near mouse
        sizeAttr.array[i] = 0.2 + intensity * 0.3;
      } else {
        // Gentle twinkling for stars
        const twinkle = Math.sin(time * 2 + i * 10) * 0.15 + 0.85;
        colorAttr.array[i3] = twinkle;
        colorAttr.array[i3 + 1] = twinkle;
        colorAttr.array[i3 + 2] = twinkle;
        
        // Default size with subtle animation
        sizeAttr.array[i] = sizes[i] * (0.8 + Math.sin(time + i) * 0.2);
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