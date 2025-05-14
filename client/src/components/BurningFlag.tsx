import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

interface BurningFlagProps {
  position: [number, number, number];
  onComplete: () => void;
}

const BurningFlag = ({ position, onComplete }: BurningFlagProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const fireRef = useRef<THREE.Points>(null);
  const poleRef = useRef<THREE.Mesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const burnTimer = useRef<number>(0);
  const burnDuration = 2.5; // seconds
  
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
  
  // Burning animation state for flag
  const [flagSpring, flagApi] = useSpring(() => ({
    scale: [1, 1, 1] as [number, number, number],
    opacity: 1,
    rotation: [0, 0, 0] as [number, number, number],
    config: { duration: burnDuration * 1000 }
  }));
  
  // Pole falling animation state
  const [poleSpring, poleApi] = useSpring(() => ({
    rotation: [0, 0, 0] as [number, number, number],
    config: { mass: 1, tension: 180, friction: 30 }
  }));
  
  // Start the burning animation
  useEffect(() => {
    // Start flag burning animation
    flagApi.start({
      scale: [0.1, 0.1, 0.1],
      opacity: 0,
      rotation: [Math.PI * 0.1, 0, Math.PI * 0.05],
    });
    
    // Start pole falling animation after a delay
    setTimeout(() => {
      poleApi.start({
        rotation: [Math.PI / 2, 0, 0],
      });
    }, burnDuration * 500);
    
    // Call onComplete when the animation is finished
    const timer = setTimeout(() => {
      onComplete();
    }, burnDuration * 1000);
    
    return () => clearTimeout(timer);
  }, [flagApi, poleApi, onComplete]);
  
  // Fire particle animation
  useFrame((_, delta) => {
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
    
    // Track burn progress
    burnTimer.current += delta;
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Falling flag pole */}
      <animated.mesh 
        ref={poleRef}
        position={[0, 1.0, 0]} 
        rotation-x={poleSpring.rotation[0]}
        rotation-y={poleSpring.rotation[1]}
        rotation-z={poleSpring.rotation[2]}
      >
        <cylinderGeometry args={[0.02, 0.02, 2.0, 8]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          roughness={0.1}
          metalness={0.9}
        />
        
        {/* Burning flag */}
        <animated.mesh
          ref={flagRef} 
          position={[0.75, 0.7, 0]}
          scale-x={flagSpring.scale[0]}
          scale-y={flagSpring.scale[1]}
          scale-z={flagSpring.scale[2]}
          rotation-x={flagSpring.rotation[0]}
          rotation-y={flagSpring.rotation[1]}
          rotation-z={flagSpring.rotation[2]}
        >
          <planeGeometry args={[1.2, 0.8, 1, 1]} />
          <meshStandardMaterial 
            color="#ff3030"
            side={THREE.DoubleSide}
            roughness={0.7}
            transparent={true}
            opacity={flagSpring.opacity}
            emissive="#ff0000"
            emissiveIntensity={0.8}
          />
        </animated.mesh>
      </animated.mesh>
      
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