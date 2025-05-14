import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

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
      
      // Parse color to ensure valid format
      let r = 255, g = 255, b = 255; // Default white
      
      try {
        if (glowColor.startsWith('#')) {
          // Hex color
          const hex = glowColor.substring(1);
          r = parseInt(hex.substring(0, 2), 16) || 255;
          g = parseInt(hex.substring(2, 4), 16) || 255;
          b = parseInt(hex.substring(4, 6), 16) || 255;
        } else if (glowColor.startsWith('rgb')) {
          // RGB or RGBA color
          const parts = glowColor.match(/\d+/g);
          if (parts && parts.length >= 3) {
            r = parseInt(parts[0]) || 255;
            g = parseInt(parts[1]) || 255;
            b = parseInt(parts[2]) || 255;
          }
        }
      } catch (e) {
        console.error("Error parsing color:", e);
        // Use default values if parsing fails
      }
      
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
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

// Enhanced Sun component
const Sun = ({ position, size = 20, rotationSpeed = 0.01, color = '#ffd54f' }) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);

  // Create sun texture with surface details
  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Base yellow-orange gradient
    const gradient = context.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, '#ff9800');
    gradient.addColorStop(0.3, '#ffeb3b');
    gradient.addColorStop(0.6, '#ffc107');
    gradient.addColorStop(1, '#ff9800');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create glow texture
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    const gradient = context.createRadialGradient(
      128, 128, 0, 
      128, 128, 128
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 141, 1.0)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 141, 0.6)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 141, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 141, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Create sun material
  const sunMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      map: sunTexture,
    });
  }, [color, sunTexture]);
  
  // Create glow material
  const glowMaterial = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8
    });
  }, [glowTexture]);
  
  // Animate rotation
  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += rotationSpeed * delta;
    }
  });
  
  return (
    <group position={position}>
      {/* Main sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 64, 32]} />
        <primitive object={sunMaterial} />
      </mesh>
      
      {/* Glow effect */}
      <sprite ref={glowRef} scale={[size * 4, size * 4, 1]}>
        <primitive object={glowMaterial} />
      </sprite>
      
      {/* Light source */}
      <pointLight 
        intensity={3} 
        distance={1000} 
        decay={0.1} 
        color={color} 
      />
    </group>
  );
};

// Main component for all celestial bodies
const CelestialBodies = () => {
  return (
    <group>
      {/* Sun */}
      <Sun 
        position={[300, 100, -400]} 
        size={25}
        rotationSpeed={0.01}
        color="#ffd54f"
      />
      
      {/* Mercury */}
      <Planet 
        position={[250, 90, -350]}
        size={3} 
        rotationSpeed={0.005} 
        color="#9e9e9e" 
      />
      
      {/* Venus */}
      <Planet 
        position={[330, 85, -350]}
        size={5} 
        rotationSpeed={0.003} 
        color="#ffeb3b" 
        cloudLayer={true}
        cloudColor="#fff9c4"
        glow={true}
        glowColor="rgba(255, 235, 59, 0.2)"
      />
      
      {/* Earth with realistic features */}
      <Planet 
        position={[-100, 30, -150]} 
        size={10} 
        rotationSpeed={0.05}
        color="#2979ff" 
        cloudLayer={true}
        cloudColor="#e1f5fe"
        glow={true}
        glowColor="rgba(41, 121, 255, 0.25)"
        glowSize={1.3}
      />
      
      {/* Mars with polar ice caps */}
      <Planet 
        position={[120, 20, -120]} 
        size={6} 
        rotationSpeed={0.047}
        color="#e53935" 
        glow={true}
        glowColor="rgba(229, 57, 53, 0.2)"
      />
      
      {/* Jupiter - gas giant */}
      <Planet 
        position={[20, -10, -220]} 
        size={15} 
        rotationSpeed={0.12}
        color="#ffa000" 
        cloudLayer={true}
        cloudColor="#ffd54f"
        glow={true}
        glowColor="rgba(255, 160, 0, 0.2)"
      />
      
      {/* Saturn with rings */}
      <Planet 
        position={[-80, 50, -180]} 
        size={13} 
        rotationSpeed={0.09}
        color="#fdd835" 
        cloudLayer={true}
        cloudColor="#fff59d"
        rings={true}
        ringColor="#f9a825"
        ringSize={2.2}
        glow={true}
        glowColor="rgba(253, 216, 53, 0.25)"
      />
      
      {/* Uranus - ice giant with rings */}
      <Planet 
        position={[140, -30, -220]} 
        size={9} 
        rotationSpeed={0.06}
        color="#00acc1" 
        cloudLayer={true}
        cloudColor="#b2ebf2"
        rings={true}
        ringColor="#b2ebf2"
        ringSize={1.8}
        glow={true}
        glowColor="rgba(0, 172, 193, 0.2)"
      />
      
      {/* Neptune - blue gas giant */}
      <Planet 
        position={[80, 40, -200]} 
        size={9} 
        rotationSpeed={0.06}
        color="#1565c0" 
        cloudLayer={true}
        cloudColor="#bbdefb"
        glow={true}
        glowColor="rgba(21, 101, 192, 0.3)"
      />
      
      {/* Pluto - distant dwarf planet */}
      <Planet 
        position={[-170, -60, -250]} 
        size={2.5} 
        rotationSpeed={0.02}
        color="#757575" 
      />
      
      {/* Purple gas giant */}
      <Planet 
        position={[180, 70, -250]} 
        size={12} 
        rotationSpeed={0.04}
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