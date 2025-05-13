import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShootingStar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  size: number;
}

const ShootingStars = () => {
  // Reference to points object
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create stars with initial positions and velocities
  const { stars, positions, opacities, sizes } = useMemo(() => {
    const starCount = 15;
    const starsArray: ShootingStar[] = [];
    const positionsArray = new Float32Array(starCount * 3);
    const opacitiesArray = new Float32Array(starCount);
    const sizesArray = new Float32Array(starCount);
    
    // Create shooting stars at random positions
    for (let i = 0; i < starCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
      );
      
      // Random direction but generally moving diagonally across the scene
      const velocity = new THREE.Vector3(
        -5 - Math.random() * 15,
        -5 - Math.random() * 15,
        -3 - Math.random() * 10
      );
      
      // Random lifetime between 6-12 seconds
      const maxLifetime = 6 + Math.random() * 6; 
      
      starsArray.push({
        position,
        velocity,
        lifetime: Math.random() * maxLifetime, // Start at random time in lifecycle
        maxLifetime,
        size: 1 + Math.random() * 2
      });
      
      // Initialize positions
      const i3 = i * 3;
      positionsArray[i3] = position.x;
      positionsArray[i3 + 1] = position.y;
      positionsArray[i3 + 2] = position.z;
      
      opacitiesArray[i] = 1.0;
      sizesArray[i] = starsArray[i].size;
    }
    
    return { 
      stars: starsArray, 
      positions: positionsArray, 
      opacities: opacitiesArray, 
      sizes: sizesArray 
    };
  }, []);
  
  // Create trail effect material
  const trailMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a radial gradient for the particle
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.25, 'rgba(255, 240, 220, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 210, 180, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.PointsMaterial({
      size: 10,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);
  
  // Animation loop
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    
    const positionsAttribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorsAttribute = pointsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
    const positions = positionsAttribute.array as Float32Array;
    const colors = colorsAttribute.array as Float32Array;
    
    // Update each star
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.lifetime += delta;
      
      // Reset star if its lifetime is over
      if (star.lifetime > star.maxLifetime) {
        star.lifetime = 0;
        star.position.set(
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000
        );
        
        // Randomize velocity on reset
        star.velocity.set(
          -5 - Math.random() * 15,
          -5 - Math.random() * 15,
          -3 - Math.random() * 10
        );
      }
      
      // Calculate opacity based on lifetime (fade in and out)
      const normalizedLife = star.lifetime / star.maxLifetime;
      let opacity = 1.0;
      
      if (normalizedLife < 0.1) {
        // Fade in
        opacity = normalizedLife / 0.1;
      } else if (normalizedLife > 0.9) {
        // Fade out
        opacity = (1.0 - normalizedLife) / 0.1;
      }
      
      // Update star position
      star.position.add(star.velocity.clone().multiplyScalar(delta));
      
      // Update buffer arrays
      const i3 = i * 3;
      positions[i3] = star.position.x;
      positions[i3 + 1] = star.position.y;
      positions[i3 + 2] = star.position.z;
      
      // Update color (white with varying opacity)
      colors[i3] = 1.0;     // R
      colors[i3 + 1] = 0.9; // G
      colors[i3 + 2] = 0.7 * opacity; // B with opacity effect
    }
    
    // Mark attributes as needing update
    positionsAttribute.needsUpdate = true;
    colorsAttribute.needsUpdate = true;
  });
  
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
          count={positions.length / 3}
          array={new Float32Array(positions.length)}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={trailMaterial} />
    </points>
  );
};

export default ShootingStars;