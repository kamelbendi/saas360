import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html, useCursor, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useAudio } from "../lib/stores/useAudio";
import { useSpring, animated } from "@react-spring/three";

interface SaasProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    position: number[];
  };
  isSelected: boolean;
  onClick: () => void;
}

const SaasProduct = ({ product, isSelected, onClick }: SaasProductProps) => {
  const { playHit } = useAudio();
  const groupRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const floatingRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Change cursor on hover
  useCursor(hovered);
  
  // Create position from the product data
  const position = new THREE.Vector3(...product.position);
  
  // Create logo texture for the flag
  const logoTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background color
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 128);
      
      // Draw border
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 124);
      
      // Draw company name
      ctx.fillStyle = '#2196f3';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text if too long
      const name = product.name;
      if (name.length > 12) {
        const words = name.split(' ');
        let line1 = '';
        let line2 = '';
        
        if (words.length > 1) {
          // Try to split at spaces
          const middleIndex = Math.floor(words.length / 2);
          line1 = words.slice(0, middleIndex).join(' ');
          line2 = words.slice(middleIndex).join(' ');
        } else {
          // Split in the middle if it's a single word
          const middle = Math.floor(name.length / 2);
          line1 = name.slice(0, middle);
          line2 = name.slice(middle);
        }
        
        ctx.fillText(line1, 128, 50);
        ctx.fillText(line2, 128, 80);
      } else {
        ctx.fillText(name, 128, 64);
      }
      
      // Create simple logo shape
      ctx.beginPath();
      ctx.arc(128, 40, 20, 0, Math.PI * 2);
      ctx.fillStyle = hovered ? '#4fc3f7' : '#2196f3';
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [product.name, hovered]);
  
  // Handle hover and click interactions
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = () => {
    playHit();
    onClick();
  };
  
  // Flag geometry with displacement for wave effect
  const flagGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1.5, 0.8, 20, 20);
    return geometry;
  }, []);

  // Flag waving animation - more subtle and restrained
  const updateFlag = (geometry: THREE.BufferGeometry, time: number) => {
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Only add wave effect to the edge of the flag (not near the pole)
      if (x > -0.3) {
        // Flag wave amplitude increases as we move right but much more subtly
        const waveStrength = (x + 0.3) / 1.5 * 0.04; // Reduced amplitude
        
        // Use slower time factor for more gentle motion
        const waveX = Math.sin(y * 3 + time * 1.5) * waveStrength;
        const waveY = Math.sin(x * 2 + time * 0.8) * waveStrength * 0.1;
        
        // Apply reduced wave deformation
        positions.setXYZ(
          i,
          x + waveX,
          y + waveY,
          waveX * 0.5 // Reduced Z-axis displacement
        );
      }
    }
    
    positions.needsUpdate = true;
  };
  
  // Flag pole waving animation (subtle)
  const poleSpring = useSpring({
    rotateX: isSelected ? 0.05 : 0,
    rotateY: isSelected ? 0.1 : 0,
    rotateZ: isSelected ? 0.05 : 0,
    config: { mass: 1, tension: 100, friction: 20 }
  });

  // Animation loop for flag and pole
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Update flag mesh wave effect
    if (floatingRef.current && floatingRef.current.geometry) {
      updateFlag(floatingRef.current.geometry, time);
    }
    
    // Subtle breathing effect for the base
    if (baseRef.current) {
      const breathingScale = 1 + Math.sin(time * 1.5) * 0.02;
      baseRef.current.scale.set(breathingScale, 1, breathingScale);
      
      if (isSelected) {
        // Slowly rotate the base when selected
        baseRef.current.rotation.y += 0.01;
      }
    }
    
    // Hover effect when selected
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = position.y + Math.sin(time) * 0.03;
    }
  });
  
  // Highlight effect when selected
  useEffect(() => {
    if (baseRef.current && floatingRef.current) {
      if (isSelected) {
        (baseRef.current.material as THREE.MeshStandardMaterial).emissive.set('#4fc3f7');
        (floatingRef.current.material as THREE.MeshStandardMaterial).emissive.set('#4fc3f7');
      } else {
        (baseRef.current.material as THREE.MeshStandardMaterial).emissive.set('#000000');
        (floatingRef.current.material as THREE.MeshStandardMaterial).emissive.set('#000000');
      }
    }
  }, [isSelected]);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Flag pole base */}
      <mesh ref={baseRef} position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.2, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#a0a0a0" : "#808080"} 
          roughness={0.7}
          metalness={0.8}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Flag pole - shorter and vertical */}
      <animated.mesh 
        position={[0, 0.9, 0]} 
        rotation-x={poleSpring.rotateX}
        rotation-y={poleSpring.rotateY}
        rotation-z={poleSpring.rotateZ}
      >
        <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          roughness={0.5}
          metalness={0.9}
        />
        
        {/* Flag with logo - smaller and positioned right */}
        <mesh 
          ref={floatingRef} 
          position={[0.35, 0.7, 0]} 
          rotation={[0, Math.PI/2, 0]}
          scale={[0.7, 0.5, 0.7]}
          geometry={flagGeometry}
        >
          <meshStandardMaterial 
            map={logoTexture}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      </animated.mesh>
      
      {/* Light on ground when selected */}
      {isSelected && (
        <pointLight
          position={[0, 0.05, 0]}
          distance={1.5}
          intensity={1}
          color="#ffffff"
        />
      )}
      
      {/* Selected marker - smaller yellow indicator on top of pole */}
      {isSelected && (
        <mesh position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
      
      {/* Glowing particles and lights */}
      <pointLight
        position={[0, 0.5, 0]}
        distance={1.5}
        intensity={hovered ? 3 : 2}
        color="#4fc3f7"
      />
      
      {/* Additional ambient light for selected items */}
      {isSelected && (
        <pointLight
          position={[0, 0.1, 0]}
          distance={3}
          intensity={1}
          color="#0277bd"
        />
      )}
      
      {/* Particle system for selected items */}
      {isSelected && (
        <points>
          <bufferGeometry>
            <float32BufferAttribute 
              attach="attributes-position" 
              array={new Float32Array(Array(30).fill(0).flatMap(() => [
                (Math.random() - 0.5) * 1.5,
                (Math.random()) * 1.5,
                (Math.random() - 0.5) * 1.5
              ]))} 
              count={30} 
              itemSize={3} 
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.05} 
            color="#4fc3f7" 
            transparent 
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Selected indicator */}
      {isSelected && (
        <Html position={[0, -0.5, 0]} center>
          <div className="selected-badge">
            Active Selection
          </div>
        </Html>
      )}
    </group>
  );
};

export default SaasProduct;
