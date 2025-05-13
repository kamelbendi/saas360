import { useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface MoonSurfaceProps {
  onRightClick: (event: any) => void;
}

const MoonSurface = ({ onRightClick }: MoonSurfaceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Using sand texture for lunar surface
  const texture = useTexture("/textures/sand.jpg");
  
  // Create normal map from SVG
  const normalMap = useTexture("/textures/moon_normal.svg");
  
  // Configure textures
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(8, 8);

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.2, 0]} 
      receiveShadow
      onContextMenu={onRightClick}
    >
      <planeGeometry args={[200, 200, 128, 128]} />
      <meshStandardMaterial 
        map={texture}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1, 1)}
        roughness={0.9}
        metalness={0.1}
        color="#d2d2d2"
        displacementScale={0.5}
      />
    </mesh>
  );
};

export default MoonSurface;
