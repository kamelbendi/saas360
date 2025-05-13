import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface GroundSurfaceProps {
  onRightClick: (event: any) => void;
}

const GroundSurface = ({ onRightClick }: GroundSurfaceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create realistic moon surface textures
  const [baseTexture, bumpTexture, normalTexture] = useMemo(() => {
    // Main color/albedo texture
    const albedoCanvas = document.createElement("canvas");
    albedoCanvas.width = 2048;
    albedoCanvas.height = 2048;
    const albedoCtx = albedoCanvas.getContext("2d");
    
    // Bump map for elevation
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = 2048;
    bumpCanvas.height = 2048;
    const bumpCtx = bumpCanvas.getContext("2d");
    
    if (albedoCtx && bumpCtx) {
      // Base color - lighter lunar grey
      albedoCtx.fillStyle = "#d0d0d0";
      albedoCtx.fillRect(0, 0, albedoCanvas.width, albedoCanvas.height);
      
      // Base bump - neutral grey
      bumpCtx.fillStyle = "#808080";
      bumpCtx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);
      
      // Create large crater features first
      for (let i = 0; i < 25; i++) {
        const x = Math.random() * albedoCanvas.width;
        const y = Math.random() * albedoCanvas.height;
        const radius = 50 + Math.random() * 250;
        
        // Color gradient for crater
        const colorGradient = albedoCtx.createRadialGradient(x, y, 0, x, y, radius);
        const centerBrightness = 0.9 + Math.random() * 0.1; // Brighter center
        const rimBrightness = 0.85 + Math.random() * 0.15; // Slightly darker rim
        const outerBrightness = 0.7 + Math.random() * 0.2; // Blend with surrounding
        
        colorGradient.addColorStop(0, `rgba(${Math.floor(215 * centerBrightness)}, ${Math.floor(215 * centerBrightness)}, ${Math.floor(215 * centerBrightness)}, 1)`);
        colorGradient.addColorStop(0.7, `rgba(${Math.floor(184 * rimBrightness)}, ${Math.floor(184 * rimBrightness)}, ${Math.floor(184 * rimBrightness)}, 1)`);
        colorGradient.addColorStop(1, `rgba(${Math.floor(184 * outerBrightness)}, ${Math.floor(184 * outerBrightness)}, ${Math.floor(184 * outerBrightness)}, 0.6)`);
        
        albedoCtx.fillStyle = colorGradient;
        albedoCtx.beginPath();
        albedoCtx.arc(x, y, radius, 0, Math.PI * 2);
        albedoCtx.fill();
        
        // Bump map for crater (darker in center, brighter at rim)
        const bumpGradient = bumpCtx.createRadialGradient(x, y, 0, x, y, radius);
        bumpGradient.addColorStop(0, "rgba(40, 40, 40, 1)"); // Deep crater center
        bumpGradient.addColorStop(0.7, "rgba(220, 220, 220, 1)"); // Elevated rim
        bumpGradient.addColorStop(1, "rgba(128, 128, 128, 0.6)"); // Blend with surroundings
        
        bumpCtx.fillStyle = bumpGradient;
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
      }
      
      // Add medium craters
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * albedoCanvas.width;
        const y = Math.random() * albedoCanvas.height;
        const radius = 20 + Math.random() * 80;
        
        // Color for medium craters
        const colorGradient = albedoCtx.createRadialGradient(x, y, 0, x, y, radius);
        colorGradient.addColorStop(0, "rgba(200, 200, 200, 1)");
        colorGradient.addColorStop(0.8, "rgba(180, 180, 180, 1)");
        colorGradient.addColorStop(1, "rgba(180, 180, 180, 0.3)");
        
        albedoCtx.fillStyle = colorGradient;
        albedoCtx.beginPath();
        albedoCtx.arc(x, y, radius, 0, Math.PI * 2);
        albedoCtx.fill();
        
        // Bump for medium craters
        const bumpGradient = bumpCtx.createRadialGradient(x, y, 0, x, y, radius);
        bumpGradient.addColorStop(0, "rgba(60, 60, 60, 1)");
        bumpGradient.addColorStop(0.8, "rgba(200, 200, 200, 1)");
        bumpGradient.addColorStop(1, "rgba(128, 128, 128, 0.3)");
        
        bumpCtx.fillStyle = bumpGradient;
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
      }
      
      // Add small craters and detail
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * albedoCanvas.width;
        const y = Math.random() * albedoCanvas.height;
        const radius = 1 + Math.random() * 10;
        
        // Random darker/lighter spots for small details
        const shade = 170 + Math.random() * 40;
        albedoCtx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.3)`;
        albedoCtx.beginPath();
        albedoCtx.arc(x, y, radius, 0, Math.PI * 2);
        albedoCtx.fill();
        
        // Small bumps/craters
        const bumpShade = 80 + Math.random() * 120;
        bumpCtx.fillStyle = `rgba(${bumpShade}, ${bumpShade}, ${bumpShade}, 0.5)`;
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
      }
      
      // Add some larger scale light/dark variations
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * albedoCanvas.width;
        const y = Math.random() * albedoCanvas.height;
        const radius = 200 + Math.random() * 400;
        
        // Mare (darker areas)
        if (Math.random() > 0.5) {
          const colorGradient = albedoCtx.createRadialGradient(x, y, 0, x, y, radius);
          colorGradient.addColorStop(0, "rgba(130, 130, 130, 0.8)");
          colorGradient.addColorStop(1, "rgba(184, 184, 184, 0)");
          
          albedoCtx.fillStyle = colorGradient;
          albedoCtx.beginPath();
          albedoCtx.arc(x, y, radius, 0, Math.PI * 2);
          albedoCtx.fill();
        } 
        // Highland (lighter areas)
        else {
          const colorGradient = albedoCtx.createRadialGradient(x, y, 0, x, y, radius);
          colorGradient.addColorStop(0, "rgba(210, 210, 210, 0.5)");
          colorGradient.addColorStop(1, "rgba(184, 184, 184, 0)");
          
          albedoCtx.fillStyle = colorGradient;
          albedoCtx.beginPath();
          albedoCtx.arc(x, y, radius, 0, Math.PI * 2);
          albedoCtx.fill();
        }
      }
    }
    
    // Create textures from canvases
    const texture = new THREE.CanvasTexture(albedoCanvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    const bump = new THREE.CanvasTexture(bumpCanvas);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(4, 4);
    
    // Generate normal map from bump map (compute lighting angles)
    const normalCanvas = document.createElement("canvas");
    normalCanvas.width = 2048;
    normalCanvas.height = 2048;
    const normalCtx = normalCanvas.getContext("2d");
    
    if (normalCtx && bumpCtx) {
      // Copy bump data
      normalCtx.drawImage(bumpCanvas, 0, 0);
      
      // Modify to create normal map
      const bumpData = bumpCtx.getImageData(0, 0, bumpCanvas.width, bumpCanvas.height);
      const normalData = normalCtx.getImageData(0, 0, normalCanvas.width, normalCanvas.height);
      
      // Simple normal map generation - not perfect but works for this purpose
      for (let y = 1; y < normalCanvas.height - 1; y++) {
        for (let x = 1; x < normalCanvas.width - 1; x++) {
          const index = (y * normalCanvas.width + x) * 4;
          
          // Calculate partial derivatives of height map
          const left = bumpData.data[index - 4] / 255;
          const right = bumpData.data[index + 4] / 255;
          const top = bumpData.data[(y - 1) * normalCanvas.width * 4 + x * 4] / 255;
          const bottom = bumpData.data[(y + 1) * normalCanvas.width * 4 + x * 4] / 255;
          
          // Compute normal vector
          const dx = (right - left) * 2.0;
          const dy = (bottom - top) * 2.0;
          const dz = 1.0;
          
          // Normalize and convert to RGB color space
          const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
          normalData.data[index] = ((dx / length) * 0.5 + 0.5) * 255;     // R: x
          normalData.data[index + 1] = ((dy / length) * 0.5 + 0.5) * 255; // G: y
          normalData.data[index + 2] = (dz / length) * 255;               // B: z
          normalData.data[index + 3] = 255;                              // A: opacity
        }
      }
      
      normalCtx.putImageData(normalData, 0, 0);
    }
    
    const normal = new THREE.CanvasTexture(normalCanvas);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(4, 4);
    
    return [texture, bump, normal];
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
          bumpMap={bumpTexture}
          normalMap={normalTexture}
          bumpScale={0.05}
          roughness={0.8}
          metalness={0.2}
          color="#d8d8d8"
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
