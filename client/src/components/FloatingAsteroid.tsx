import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';

interface FloatingAsteroidProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  duration?: number;
  size?: number;
  color?: string;
}

const FloatingAsteroid = ({
  startPosition,
  endPosition,
  duration = 40,
  size = 1,
  color = '#8B8B8B',
}: FloatingAsteroidProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Track animation progress
  const progressRef = useRef(Math.random()); // Start at a random position in the path
  
  // Generate random rotation speeds
  const rotationSpeed = useMemo(() => {
    return {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.01,
    };
  }, []);
  
  // Create a random asteroid shape
  const geometry = useMemo(() => {
    const baseGeometry = new THREE.IcosahedronGeometry(size, 1);
    const positions = baseGeometry.attributes.position as THREE.BufferAttribute;
    
    // Randomly displace vertices for a more irregular shape
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      const distortionFactor = 0.2;
      positions.setXYZ(
        i,
        x + (Math.random() - 0.5) * distortionFactor,
        y + (Math.random() - 0.5) * distortionFactor,
        z + (Math.random() - 0.5) * distortionFactor
      );
    }
    
    // Update normals for proper lighting
    baseGeometry.computeVertexNormals();
    
    return baseGeometry;
  }, [size]);
  
  // Animation loop
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Update rotation
    meshRef.current.rotation.x += rotationSpeed.x;
    meshRef.current.rotation.y += rotationSpeed.y;
    meshRef.current.rotation.z += rotationSpeed.z;
    
    // Update position along path
    progressRef.current = (progressRef.current + delta / duration) % 1;
    
    // Interpolate position between start and end
    meshRef.current.position.set(
      startPosition[0] + (endPosition[0] - startPosition[0]) * progressRef.current,
      startPosition[1] + (endPosition[1] - startPosition[1]) * progressRef.current,
      startPosition[2] + (endPosition[2] - startPosition[2]) * progressRef.current
    );
  });

  return (
    <mesh ref={meshRef} position={startPosition} geometry={geometry} castShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        metalness={0.2}
        flatShading
      />
    </mesh>
  );
};

// Function to create multiple random asteroids
export const createRandomAsteroids = (count: number, radius: number, height: number) => {
  const asteroids = [];
  
  for (let i = 0; i < count; i++) {
    // Create random start and end positions on a circular path
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = (angle1 + Math.PI + (Math.random() - 0.5) * Math.PI) % (Math.PI * 2);
    
    const dist = radius + (Math.random() - 0.5) * 10;
    const y = Math.random() * height - height / 2;
    
    const startPosition: [number, number, number] = [
      Math.sin(angle1) * dist,
      y,
      Math.cos(angle1) * dist,
    ];
    
    const endPosition: [number, number, number] = [
      Math.sin(angle2) * dist,
      y + (Math.random() - 0.5) * 10,
      Math.cos(angle2) * dist,
    ];
    
    // Random properties
    const size = 0.3 + Math.random() * 0.7;
    const duration = 30 + Math.random() * 40;
    
    // Gray color with a slight variation
    const grayValue = 120 + Math.floor(Math.random() * 50);
    const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    
    asteroids.push(
      <FloatingAsteroid
        key={`asteroid-${i}`}
        startPosition={startPosition}
        endPosition={endPosition}
        size={size}
        duration={duration}
        color={color}
      />
    );
  }
  
  return asteroids;
};

export default FloatingAsteroid;