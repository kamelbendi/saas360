import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const SpaceSkybox = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  
  // Using sky texture for the skybox
  const skyTexture = useTexture("/textures/sky.png");
  const earthTexture = useTexture("/textures/earth.svg");
  
  // Star field parameters
  const starCount = 200;
  const starPositions = Array(starCount * 3).fill(0).map(() => (Math.random() - 0.5) * 2000);
  
  // Slow rotation of the skybox
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0001;
    }
    
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <>
      {/* Sky sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial 
          map={skyTexture} 
          side={THREE.BackSide} 
          color="#040a16" 
        />
      </mesh>
      
      {/* Earth in the distance */}
      <mesh ref={earthRef} position={[-180, 60, -250]}>
        <sphereGeometry args={[30, 32, 32]} />
        <meshStandardMaterial 
          map={earthTexture}
          emissiveMap={earthTexture}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Distant stars as points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={new Float32Array(starPositions)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={2} 
          color="#ffffff" 
          sizeAttenuation 
        />
      </points>
      
      {/* Sun/light source */}
      <mesh position={[300, 100, -100]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#fff9c4" />
      </mesh>
      <pointLight 
        position={[300, 100, -100]} 
        intensity={1} 
        distance={1000} 
        decay={2} 
      />
    </>
  );
};

export default SpaceSkybox;
