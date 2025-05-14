import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BurningFlagProps {
  position: [number, number, number];
  onComplete: () => void;
}

const BurningFlag = ({ position, onComplete }: BurningFlagProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const fireRef = useRef<THREE.Points>(null);
  const poleRef = useRef<THREE.Mesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const burnDuration = 2.5; // seconds
  
  // Animation values
  const [flagOpacity, setFlagOpacity] = useState(1);
  const [flagScale, setFlagScale] = useState(1);
  const [flagRotationX, setFlagRotationX] = useState(0);
  const [flagRotationZ, setFlagRotationZ] = useState(0);
  const [poleRotationX, setPoleRotationX] = useState(0);
  
  // Create particles for fire effect
  const fireParticles = useMemo(() => {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions within flag area
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1.2; // x
      positions[i3 + 1] = Math.random() * 0.8 + 0.7; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 0.1; // z
      
      // Random particle sizes
      sizes[i] = Math.random() * 0.05 + 0.02;
      
      // Colors gradient from yellow to red to smoke
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        // Yellow flame core
        colors[i3] = 1;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 0.2;
      } else if (colorChoice < 0.7) {
        // Orange-red middle
        colors[i3] = 1;
        colors[i3 + 1] = 0.3;
        colors[i3 + 2] = 0.1;
      } else {
        // Dark smoke edges
        const smoke = 0.2 + Math.random() * 0.2;
        colors[i3] = smoke;
        colors[i3 + 1] = smoke;
        colors[i3 + 2] = smoke;
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);
  
  // Flag burning animation
  useFrame((_, delta) => {
    // Update flag opacity and scale
    if (flagOpacity > 0) {
      setFlagOpacity(prev => Math.max(0, prev - delta / burnDuration));
    }
    
    if (flagScale > 0.1) {
      setFlagScale(prev => Math.max(0.1, prev - delta / burnDuration));
    }
    
    // Add some random wobble to flag as it burns
    setFlagRotationX(prev => prev + delta * 0.2);
    setFlagRotationZ(prev => prev + delta * 0.3);
    
    // Pole falling animation starts halfway through the burn
    if (flagOpacity < 0.5 && poleRotationX < Math.PI / 2) {
      setPoleRotationX(prev => Math.min(Math.PI / 2, prev + delta * 1.2));
    }
    
    // Fire particle animation
    if (fireRef.current) {
      const positions = fireRef.current.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Update Y position (particles rise up)
        positions[i3 + 1] += delta * (0.5 + Math.random() * 0.5);
        
        // Random movement in X and Z
        positions[i3] += delta * (Math.random() - 0.5) * 0.2;
        positions[i3 + 2] += delta * (Math.random() - 0.5) * 0.2;
        
        // Reset particles that go too far
        if (positions[i3 + 1] > 2) {
          positions[i3] = (Math.random() - 0.5) * 1.2;
          positions[i3 + 1] = 0.7 + Math.random() * 0.3;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
        }
      }
      
      fireRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  // Complete animation
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, burnDuration * 1000);
    
    return () => clearTimeout(timer);
  }, [onComplete, burnDuration]);
  
  return (
    <group ref={groupRef} position={position}>
      {/* Falling flag pole */}
      <mesh 
        ref={poleRef}
        position={[0, 1.0, 0]} 
        rotation-x={poleRotationX}
      >
        <cylinderGeometry args={[0.02, 0.02, 2.0, 8]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          roughness={0.1}
          metalness={0.9}
        />
        
        {/* Burning flag */}
        <mesh
          ref={flagRef} 
          position={[0.75, 0.7, 0]}
          scale={flagScale}
          rotation-x={flagRotationX}
          rotation-z={flagRotationZ}
        >
          <planeGeometry args={[1.2, 0.8, 1, 1]} />
          <meshStandardMaterial 
            color="#ff3030"
            side={THREE.DoubleSide}
            roughness={0.7}
            transparent={true}
            opacity={flagOpacity}
            emissive="#ff0000"
            emissiveIntensity={0.8}
          />
        </mesh>
      </mesh>
      
      {/* Base - remains in place */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
        <meshStandardMaterial 
          color="#e0e0e0" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Fire particles */}
      <points ref={fireRef} position={[0.75, 1.7, 0]}>
        <primitive object={fireParticles} />
        <pointsMaterial 
          size={0.1}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Fire light */}
      <pointLight
        position={[0.75, 1.7, 0.2]}
        intensity={3.0}
        distance={5}
        color="#ff5500"
        decay={2}
      />
    </group>
  );
};

export default BurningFlag;