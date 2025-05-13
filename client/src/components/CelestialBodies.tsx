import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  rotationSpeed: number;
  color: string;
  emissive?: boolean;
  emissiveIntensity?: number;
  rings?: boolean;
  ringColor?: string;
  ringSize?: number;
  cloudLayer?: boolean;
  cloudColor?: string;
  glow?: boolean;
  glowColor?: string;
  glowSize?: number;
}

// Component to create a planet with custom properties
const Planet = ({ 
  position, 
  size, 
  rotationSpeed, 
  color,
  emissive = false,
  emissiveIntensity = 0.2,
  rings = false,
  ringColor = '#f0f0f0',
  ringSize = 1.2,
  cloudLayer = false,
  cloudColor = '#ffffff',
  glow = false,
  glowColor = '#ffffff',
  glowSize = 1.2,
}: PlanetProps) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed * delta;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeed * 1.5 * delta;
    }
    
    if (ringsRef.current) {
      ringsRef.current.rotation.x = Math.PI / 4; // Tilt rings
    }
  });

  // Create planet material
  const planetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.1,
      emissive: emissive ? new THREE.Color(color) : new THREE.Color('#000000'),
      emissiveIntensity: emissiveIntensity,
    });
  }, [color, emissive, emissiveIntensity]);

  // Create cloud material if needed
  const cloudMaterial = useMemo(() => {
    if (!cloudLayer) return null;
    
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(cloudColor),
      transparent: true,
      opacity: 0.5,
      roughness: 0.8,
      metalness: 0.0,
    });
  }, [cloudLayer, cloudColor]);

  // Create ring material if needed
  const ringMaterial = useMemo(() => {
    if (!rings) return null;
    
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(ringColor),
      transparent: true,
      opacity: 0.7,
      roughness: 0.6,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
  }, [rings, ringColor]);

  // Create glow sprite material if needed
  const glowMaterial = useMemo(() => {
    if (!glow) return null;
    
    // Create a radial gradient for the glow
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    
    const glowTexture = new THREE.CanvasTexture(canvas);
    
    return new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [glow, glowColor]);

  return (
    <group position={position}>
      {/* Main planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <primitive object={planetMaterial} />
      </mesh>
      
      {/* Cloud layer if enabled */}
      {cloudLayer && cloudMaterial && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[size * 1.05, 32, 32]} />
          <primitive object={cloudMaterial} />
        </mesh>
      )}
      
      {/* Rings if enabled */}
      {rings && ringMaterial && (
        <mesh ref={ringsRef}>
          <ringGeometry args={[size * 1.5, size * ringSize, 64]} />
          <primitive object={ringMaterial} />
        </mesh>
      )}
      
      {/* Glow effect if enabled */}
      {glow && glowMaterial && (
        <sprite ref={glowRef} scale={[size * glowSize * 2, size * glowSize * 2, 1]}>
          <primitive object={glowMaterial} />
        </sprite>
      )}
    </group>
  );
};

// Main component for all celestial bodies
const CelestialBodies = () => {
  return (
    <group>
      {/* Earth (blue planet with cloud layer) */}
      <Planet 
        position={[-100, 30, -150]} 
        size={10} 
        rotationSpeed={0.05} 
        color="#1e88e5" 
        cloudLayer={true}
        cloudColor="#e1f5fe"
        glow={true}
        glowColor="rgba(100, 149, 237, 0.5)"
        glowSize={1.5}
      />
      
      {/* Mars (red planet) */}
      <Planet 
        position={[120, 20, -120]} 
        size={6} 
        rotationSpeed={0.03} 
        color="#e53935" 
        glow={true}
        glowColor="rgba(229, 57, 53, 0.3)"
      />
      
      {/* Saturn (golden planet with rings) */}
      <Planet 
        position={[-80, 50, -180]} 
        size={8} 
        rotationSpeed={0.02} 
        color="#fdd835" 
        rings={true}
        ringColor="#f9a825"
        ringSize={2.2}
      />
      
      {/* Distant star/sun (bright with glow) */}
      <Planet 
        position={[200, 100, -300]} 
        size={15} 
        rotationSpeed={0.01} 
        color="#ffd54f" 
        emissive={true}
        emissiveIntensity={0.8}
        glow={true}
        glowColor="rgba(255, 213, 79, 0.7)"
        glowSize={3}
      />
      
      {/* Small blue moon */}
      <Planet 
        position={[-40, -10, -100]} 
        size={3} 
        rotationSpeed={0.07} 
        color="#81d4fa" 
      />
      
      {/* Distant purple gas giant */}
      <Planet 
        position={[180, 70, -250]} 
        size={12} 
        rotationSpeed={0.015} 
        color="#9c27b0"
        cloudLayer={true}
        cloudColor="#ce93d8"
        glow={true}
        glowColor="rgba(156, 39, 176, 0.2)"
      />
    </group>
  );
};

export default CelestialBodies;