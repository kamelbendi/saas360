import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface GroundSurfaceProps {
  onRightClick: (event: any) => void;
}

const GroundSurface = ({ onRightClick }: GroundSurfaceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a grey textured surface
  const baseTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Fill with base grey
      ctx.fillStyle = "#555555";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle texture
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        
        // Use different shades of grey
        const shade = 70 + Math.random() * 40;
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add some slightly lighter areas
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 50 + Math.random() * 150;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(120, 120, 120, 0.3)");
        gradient.addColorStop(1, "rgba(85, 85, 85, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add some grid lines
      ctx.strokeStyle = "rgba(70, 70, 70, 0.3)";
      ctx.lineWidth = 1;
      
      const gridSize = 64;
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }, []);

  return (
    <>
      {/* Curved ground (sphere instead of plane) */}
      <mesh 
        ref={meshRef}
        position={[0, -50, 0]} 
        receiveShadow
        onContextMenu={onRightClick}
      >
        <sphereGeometry args={[50, 128, 128, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          map={baseTexture}
          roughness={0.9}
          metalness={0.1}
          color="#7a7a7a"
        />
      </mesh>
      
      {/* Horizon glow */}
      <mesh position={[0, -49.5, 0]}>
        <ringGeometry args={[49.8, 50.2, 64]} />
        <meshBasicMaterial 
          color="#444444" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
};

export default GroundSurface;
