import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
  duration = 20,
  size = 1.5,
  color = "#aaa"
}: FloatingAsteroidProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const progress = useRef(0);
  
  // Create a custom asteroid geometry
  const geometry = useMemo(() => {
    // Start with a simple dodecahedron
    const baseGeometry = new THREE.DodecahedronGeometry(size, 0);
    
    // Deform the geometry to make it look more like an asteroid
    const positions = baseGeometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);
      
      // Add some noise to the vertex position
      vertex.x += (Math.random() - 0.5) * 0.2 * size;
      vertex.y += (Math.random() - 0.5) * 0.2 * size;
      vertex.z += (Math.random() - 0.5) * 0.2 * size;
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    baseGeometry.computeVertexNormals();
    return baseGeometry;
  }, [size]);
  
  // Add a little trail effect
  const trailMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#f57c00",
      transparent: true,
      opacity: 0.4
    });
  }, []);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Calculate progress based on time
    const elapsed = (Date.now() - startTime.current) / 1000;
    progress.current = (elapsed % duration) / duration;
    
    // Interpolate position
    const x = THREE.MathUtils.lerp(startPosition[0], endPosition[0], progress.current);
    const y = THREE.MathUtils.lerp(startPosition[1], endPosition[1], progress.current);
    const z = THREE.MathUtils.lerp(startPosition[2], endPosition[2], progress.current);
    
    meshRef.current.position.set(x, y, z);
    
    // Rotate asteroid
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.02;
    meshRef.current.rotation.z += 0.005;
  });
  
  return (
    <group>
      {/* Main asteroid */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Trailing particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh 
          key={`trail-${i}`}
          position={[
            startPosition[0] + (endPosition[0] - startPosition[0]) * (progress.current - 0.02 * (i + 1)),
            startPosition[1] + (endPosition[1] - startPosition[1]) * (progress.current - 0.02 * (i + 1)),
            startPosition[2] + (endPosition[2] - startPosition[2]) * (progress.current - 0.02 * (i + 1))
          ]}
          scale={[(6 - i) / 15, (6 - i) / 15, (6 - i) / 15]}
        >
          <sphereGeometry args={[size / 3, 8, 8]} />
          <primitive object={trailMaterial} />
        </mesh>
      ))}
    </group>
  );
};

export default FloatingAsteroid;