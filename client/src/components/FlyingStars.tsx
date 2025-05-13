import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  color: THREE.Color;
  life: number;
  maxLife: number;
}

const FlyingStars = () => {
  const starGroupRef = useRef<THREE.Group>(null);
  
  // Create a set of star particles
  const stars = useMemo(() => {
    const starsArray: StarParticle[] = [];
    
    // Create 120 stars
    for (let i = 0; i < 120; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      
      // Set velocity in a somewhat random direction but with an overall pattern
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.2
      );
      
      // Normalize and scale for consistent speed
      velocity.normalize().multiplyScalar(0.1 + Math.random() * 0.2);
      
      // Different star colors (mostly white with some variations)
      const colorIndex = Math.random();
      let color: THREE.Color;
      
      if (colorIndex < 0.7) {
        // White/blue-ish (majority)
        color = new THREE.Color(0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1, 1.0);
      } else if (colorIndex < 0.85) {
        // Yellow-ish
        color = new THREE.Color(1.0, 0.9 + Math.random() * 0.1, 0.7 + Math.random() * 0.3);
      } else {
        // Red-ish
        color = new THREE.Color(1.0, 0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
      }
      
      // Maximum lifetime between 30 and 60 seconds
      const maxLife = 30 + Math.random() * 30;
      
      starsArray.push({
        position,
        velocity,
        size: 0.05 + Math.random() * 0.15,
        color,
        life: Math.random() * maxLife, // Start at random point in lifecycle
        maxLife
      });
    }
    
    return starsArray;
  }, []);
  
  // Star material with glow effect
  const starMaterial = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create radial gradient for glow effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  }, []);
  
  // Animation frame
  useFrame((_, delta) => {
    if (!starGroupRef.current) return;
    
    // Update each star
    stars.forEach((star, index) => {
      star.life += delta;
      
      // Reset star if it's too old
      if (star.life > star.maxLife) {
        star.life = 0;
        star.position.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        );
      }
      
      // Move star based on velocity
      star.position.add(star.velocity.clone().multiplyScalar(delta * 30));
      
      // Get the sprite element
      const sprite = starGroupRef.current?.children[index] as THREE.Sprite;
      if (sprite) {
        // Update position
        sprite.position.copy(star.position);
        
        // Blink/pulse effect
        const pulseFrequency = 0.5 + Math.random() * 2;
        const pulseAmount = Math.sin(star.life * pulseFrequency) * 0.1 + 0.9;
        sprite.scale.set(star.size * pulseAmount, star.size * pulseAmount, 1);
        
        // Update color/opacity
        (sprite.material as THREE.SpriteMaterial).color.copy(star.color);
      }
    });
  });
  
  return (
    <group ref={starGroupRef}>
      {stars.map((star, index) => (
        <sprite key={index} position={star.position.toArray()}>
          <primitive object={starMaterial.clone()} />
        </sprite>
      ))}
    </group>
  );
};

export default FlyingStars;