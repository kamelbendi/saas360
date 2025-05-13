import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import FloatingAsteroid from "./FloatingAsteroid";

const SpaceSkybox = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const earthCloudsRef = useRef<THREE.Mesh>(null);
  const starFieldRef = useRef<THREE.Points>(null);
  
  // Using sky texture for the skybox
  const skyTexture = useTexture("/textures/sky.png");
  
  // Create realistic Earth textures programmatically
  const earthBaseTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Create gradient for ocean
      const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGradient.addColorStop(0, "#0077be");
      oceanGradient.addColorStop(0.5, "#0077be");
      oceanGradient.addColorStop(1, "#004a77");
      
      // Fill with ocean
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw landmasses
      ctx.fillStyle = "#3D9E56";
      
      // North America
      ctx.beginPath();
      ctx.moveTo(200, 150);
      ctx.bezierCurveTo(220, 130, 250, 120, 280, 140);
      ctx.bezierCurveTo(300, 160, 310, 180, 280, 220);
      ctx.bezierCurveTo(260, 240, 230, 250, 210, 230);
      ctx.bezierCurveTo(190, 210, 180, 170, 200, 150);
      ctx.fill();
      
      // South America
      ctx.beginPath();
      ctx.moveTo(280, 270);
      ctx.bezierCurveTo(300, 260, 320, 280, 310, 320);
      ctx.bezierCurveTo(300, 350, 270, 360, 260, 330);
      ctx.bezierCurveTo(250, 300, 260, 280, 280, 270);
      ctx.fill();
      
      // Europe & Africa
      ctx.beginPath();
      ctx.moveTo(450, 150);
      ctx.bezierCurveTo(480, 140, 520, 150, 540, 190);
      ctx.bezierCurveTo(550, 240, 530, 290, 500, 320);
      ctx.bezierCurveTo(480, 340, 460, 330, 450, 290);
      ctx.bezierCurveTo(440, 250, 430, 200, 450, 150);
      ctx.fill();
      
      // Asia & Australia
      ctx.beginPath();
      ctx.moveTo(600, 150);
      ctx.bezierCurveTo(650, 130, 700, 160, 720, 190);
      ctx.bezierCurveTo(730, 230, 720, 260, 690, 280);
      ctx.bezierCurveTo(670, 290, 650, 280, 640, 260);
      ctx.bezierCurveTo(610, 230, 580, 190, 600, 150);
      ctx.fill();
      
      // Australia
      ctx.beginPath();
      ctx.moveTo(700, 300);
      ctx.bezierCurveTo(720, 290, 750, 300, 760, 320);
      ctx.bezierCurveTo(770, 340, 760, 360, 740, 370);
      ctx.bezierCurveTo(720, 380, 700, 370, 690, 350);
      ctx.bezierCurveTo(680, 330, 680, 310, 700, 300);
      ctx.fill();
      
      // Antarctica
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(512, 450, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // Add some noise for realism
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  // Create cloud texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw cloud patterns
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 20 + Math.random() * 100;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  // Create more realistic star field
  const { starPositions, starSizes, starColors } = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Position
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;
      
      // Size
      const isBright = Math.random() > 0.97;
      sizes[i] = isBright ? 2 + Math.random() * 3 : 0.5 + Math.random();
      
      // Color
      const color = new THREE.Color();
      
      // Some stars with color variation
      if (Math.random() > 0.9) {
        // Blue, white, or reddish
        const colorType = Math.random();
        if (colorType < 0.33) {
          color.setRGB(0.8, 0.9, 1); // Blue-ish
        } else if (colorType < 0.66) {
          color.setRGB(1, 0.9, 0.8); // Yellow-ish
        } else {
          color.setRGB(1, 0.8, 0.8); // Red-ish
        }
      } else {
        // White with slight variations
        const brightness = 0.8 + Math.random() * 0.2;
        color.setRGB(brightness, brightness, brightness);
      }
      
      color.toArray(colors, i3);
    }
    
    return { starPositions: positions, starSizes: sizes, starColors: colors };
  }, []);
  
  // Animation for Earth and stars
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0001;
    }
    
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0003;
    }
    
    if (earthCloudsRef.current) {
      earthCloudsRef.current.rotation.y += 0.0004; // Clouds move slightly faster
    }
    
    if (starFieldRef.current) {
      starFieldRef.current.rotation.y += 0.0001;
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
          color="#000511" 
        />
      </mesh>
      
      {/* Earth in the distance */}
      <group position={[-180, 60, -250]}>
        {/* Earth base */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[30, 64, 32]} />
          <meshPhongMaterial 
            map={earthBaseTexture}
            shininess={5}
            specular={new THREE.Color("#333")}
          />
        </mesh>
        
        {/* Earth clouds layer */}
        <mesh ref={earthCloudsRef}>
          <sphereGeometry args={[30.5, 64, 32]} />
          <meshPhongMaterial 
            map={cloudTexture}
            transparent={true}
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
        
        {/* Atmosphere glow */}
        <mesh>
          <sphereGeometry args={[32, 32, 16]} />
          <meshBasicMaterial 
            color="#4fc3f7"
            transparent={true}
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
      
      {/* Enhanced star field */}
      <points ref={starFieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starColors.length / 3}
            array={starColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starSizes.length}
            array={starSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={1.5}
          vertexColors
          transparent
          alphaTest={0.1}
          sizeAttenuation
        />
      </points>
      
      {/* Sun/light source */}
      <mesh position={[300, 100, -100]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#fff9c4" />
        {/* Sun glow */}
        <mesh>
          <sphereGeometry args={[20, 32, 16]} />
          <meshBasicMaterial 
            color="#fffde7"
            transparent={true}
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>
      <pointLight 
        position={[300, 100, -100]} 
        intensity={1} 
        distance={1000} 
        decay={2} 
      />
      
      {/* Secondary light for better ambience */}
      <pointLight
        position={[-300, -100, 200]}
        intensity={0.2}
        color="#6fc0ff"
        distance={500}
        decay={2}
      />
      
      {/* Distant Mars */}
      <mesh position={[150, -50, -300]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial 
          color="#c62828"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Distant moon */}
      <mesh position={[250, 30, -200]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial 
          color="#e0e0e0"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Saturn-like planet with rings */}
      <group position={[-250, -40, -350]} rotation={[0.2, 0.3, 0.1]}>
        <mesh>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial 
            color="#ffd54f"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
        {/* Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[16, 24, 32]} />
          <meshStandardMaterial 
            color="#e6ce99"
            roughness={0.5}
            metalness={0.3}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      
      {/* Asteroid belt (small rocks) */}
      {Array.from({ length: 50 }).map((_, i) => {
        const angle = (i / 50) * Math.PI * 2;
        const dist = 100 + Math.random() * 20;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = (Math.random() - 0.5) * 40;
        const size = 0.5 + Math.random() * 1.5;
        
        return (
          <mesh 
            key={`asteroid-${i}`} 
            position={[x, y, z - 150]} 
            rotation={[
              Math.random() * Math.PI, 
              Math.random() * Math.PI, 
              Math.random() * Math.PI
            ]}
          >
            <dodecahedronGeometry args={[size, 0]} />
            <meshStandardMaterial 
              color="#9e9e9e"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </>
  );
};

export default SpaceSkybox;
