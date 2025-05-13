import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Simple ambient particles floating around the moon
const AnimatedBackground = () => {
  // Use ref to store particles that will animate
  const groupRef = useRef<THREE.Group>(null);
  
  // Create particles through Three.js methods rather than with buffer attributes
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Rotate the entire group slowly
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });
  
  return (
    // We don't need the interactive grid - just return an empty group
    <group ref={groupRef}>
      {/* Empty group - no more blue grid lines */}
    </group>
  );
};

export default AnimatedBackground;