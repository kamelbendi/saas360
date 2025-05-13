import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { Toaster } from "sonner";
import * as THREE from "three";
import { useAudio } from "./lib/stores/useAudio";
import LoadingScreen from "./components/UI/LoadingScreen";
import FloatingTitle from "./components/UI/FloatingTitle";
import LunarEnvironment from "./components/LunarEnvironment";
import "@fontsource/inter";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setBackgroundMusic } = useAudio();
  
  // Setup background music
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    // Preload hit and success sounds
    const hitSound = new Audio("/sounds/hit.mp3");
    const successSound = new Audio("/sounds/success.mp3");
    hitSound.preload = "auto";
    successSound.preload = "auto";
    
    // Set fake loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [setBackgroundMusic]);
  
  // No need for custom THREE definition now that we imported it directly
  
  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Canvas 
            shadows
            camera={{ 
              position: [0, 5, 15], 
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{ 
              antialias: true,
              powerPreference: "default",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0
            }}
          >
            <Suspense fallback={null}>
              <LunarEnvironment />
            </Suspense>
          </Canvas>
          <Loader />
          <FloatingTitle />
          <Toaster position="top-right" richColors />
        </>
      )}
    </>
  );
}

export default App;
