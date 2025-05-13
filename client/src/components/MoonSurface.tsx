import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface MoonSurfaceProps {
  onRightClick: (event: any) => void;
}

const MoonSurface = ({ onRightClick }: MoonSurfaceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Using better textures for lunar surface
  const baseTexture = useTexture("/textures/lunar_surface.svg");
  const normalMap = useTexture("/textures/moon_normal.svg");
  
  // Configure textures
  baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
  baseTexture.repeat.set(8, 8);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(8, 8);
  
  // Create displacement map for crater effects
  const displacementMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Fill with base gray
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add random craters
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 5 + Math.random() * 50;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.3, "rgba(200, 200, 200, 0.3)");
        gradient.addColorStop(1, "rgba(100, 100, 100, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.2, 0]} 
      receiveShadow
      onContextMenu={onRightClick}
    >
      <planeGeometry args={[200, 200, 256, 256]} />
      <meshStandardMaterial 
        map={baseTexture}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1.5, 1.5)}
        displacementMap={displacementMap}
        displacementScale={0.3}
        roughness={0.8}
        metalness={0.2}
        color="#c9c9c9"
        aoMapIntensity={1}
      />
    </mesh>
  );
};

export default MoonSurface;
