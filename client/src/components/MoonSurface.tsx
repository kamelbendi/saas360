import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface MoonSurfaceProps {
  onRightClick: (event: any) => void;
}

const MoonSurface = ({ onRightClick }: MoonSurfaceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Using better textures for lunar surface
  const baseTexture = useTexture("/textures/moon_craters.svg");
  const normalMap = useTexture("/textures/moon_normal.svg");
  
  // Configure textures
  baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
  baseTexture.repeat.set(4, 4);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4);
  
  // Create displacement map for crater effects
  const displacementMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Fill with base gray
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create large crater patterns
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 30 + Math.random() * 80;
        
        // Crater rim (higher)
        const rimGradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius);
        rimGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        rimGradient.addColorStop(1, "rgba(100, 100, 100, 0)");
        
        ctx.fillStyle = rimGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Crater depression (lower)
        const craterGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.8);
        craterGradient.addColorStop(0, "rgba(30, 30, 30, 0.8)");
        craterGradient.addColorStop(1, "rgba(100, 100, 100, 0)");
        
        ctx.fillStyle = craterGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add smaller craters
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 5 + Math.random() * 25;
        
        // Small crater rim
        const smallRimGradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius);
        smallRimGradient.addColorStop(0, "rgba(220, 220, 220, 0.7)");
        smallRimGradient.addColorStop(1, "rgba(100, 100, 100, 0)");
        
        ctx.fillStyle = smallRimGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Small crater depression
        const smallCraterGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.8);
        smallCraterGradient.addColorStop(0, "rgba(50, 50, 50, 0.6)");
        smallCraterGradient.addColorStop(1, "rgba(100, 100, 100, 0)");
        
        ctx.fillStyle = smallCraterGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add subtle noise for texture variation
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3;
        const brightness = 100 + Math.random() * 100;
        
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
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
        normalScale={new THREE.Vector2(1.8, 1.8)}
        displacementMap={displacementMap}
        displacementScale={0.4}
        roughness={0.85}
        metalness={0.1}
        color="#e1e1e1"
        aoMapIntensity={1}
      />
    </mesh>
  );
};

export default MoonSurface;
