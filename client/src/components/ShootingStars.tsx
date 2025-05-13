import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ShootingStar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  size: number;
}

const MAX_STARS = 10;
const SPAWN_DELAY = 2000; // ms

const ShootingStars = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const starsRef = useRef<ShootingStar[]>([]);
  const lastSpawnRef = useRef<number>(0);

  // Create star trail material
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a radial gradient for the star point
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.1, 'rgba(200, 220, 255, 0.8)');
      grad.addColorStop(0.5, 'rgba(150, 180, 255, 0.3)');
      grad.addColorStop(1, 'rgba(100, 100, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.PointsMaterial({
      size: 2,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
  }, []);

  // Initialize stars buffer
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(MAX_STARS * 3);
    const colors = new Float32Array(MAX_STARS * 3);
    
    // Initialize with invisible positions
    for (let i = 0; i < MAX_STARS; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    }
    
    return { positions, colors };
  }, []);

  // Spawn a new shooting star
  const spawnStar = () => {
    // Random position high in the sky
    const startX = (Math.random() - 0.5) * 200;
    const startY = 40 + Math.random() * 40;
    const startZ = (Math.random() - 0.5) * 200;
    
    // Random direction, but always going down
    const endX = startX + (Math.random() - 0.5) * 100;
    const endY = -20;
    const endZ = startZ + (Math.random() - 0.5) * 100;
    
    const direction = new THREE.Vector3(
      endX - startX,
      endY - startY,
      endZ - startZ
    ).normalize();
    
    // Random speed
    const speed = 0.5 + Math.random() * 1.5;
    
    const star: ShootingStar = {
      position: new THREE.Vector3(startX, startY, startZ),
      velocity: direction.multiplyScalar(speed),
      lifetime: 0,
      maxLifetime: 3 + Math.random() * 3,
      size: 0.5 + Math.random() * 1.5
    };
    
    starsRef.current.push(star);
  };

  // Update and manage stars on each frame
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    const positionAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = pointsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
    const sizeAttr = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute;
    
    const now = Date.now();
    
    // Spawn new stars with delay
    if (now - lastSpawnRef.current > SPAWN_DELAY && starsRef.current.length < MAX_STARS) {
      spawnStar();
      lastSpawnRef.current = now;
    }
    
    // Update existing stars
    for (let i = starsRef.current.length - 1; i >= 0; i--) {
      const star = starsRef.current[i];
      
      // Update position based on velocity
      star.position.add(star.velocity.clone().multiplyScalar(delta));
      
      // Update lifetime
      star.lifetime += delta;
      
      // Remove dead stars
      if (star.lifetime >= star.maxLifetime || star.position.y < -30) {
        starsRef.current.splice(i, 1);
        continue;
      }
      
      // Calculate alpha based on lifetime
      const lifeProgress = star.lifetime / star.maxLifetime;
      let alpha = 1;
      
      // Fade in and out
      if (lifeProgress < 0.1) {
        alpha = lifeProgress / 0.1; // Fade in
      } else if (lifeProgress > 0.7) {
        alpha = 1 - ((lifeProgress - 0.7) / 0.3); // Fade out
      }
      
      // Update buffer attributes
      const i3 = i * 3;
      
      positionAttr.array[i3] = star.position.x;
      positionAttr.array[i3 + 1] = star.position.y;
      positionAttr.array[i3 + 2] = star.position.z;
      
      // White-blue color with alpha
      colorAttr.array[i3] = 0.8 + alpha * 0.2;
      colorAttr.array[i3 + 1] = 0.9 + alpha * 0.1;
      colorAttr.array[i3 + 2] = 1.0;
      
      // Update size
      sizeAttr.array[i] = star.size * alpha;
    }
    
    // Hide unused stars
    for (let i = starsRef.current.length; i < MAX_STARS; i++) {
      const i3 = i * 3;
      
      // Move far away and make invisible
      positionAttr.array[i3] = 1000;
      positionAttr.array[i3 + 1] = 1000;
      positionAttr.array[i3 + 2] = 1000;
      
      // Set size to 0
      sizeAttr.array[i] = 0;
    }
    
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_STARS}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={MAX_STARS}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={MAX_STARS}
          array={new Float32Array(MAX_STARS).fill(1)}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={material} />
    </points>
  );
};

export default ShootingStars;