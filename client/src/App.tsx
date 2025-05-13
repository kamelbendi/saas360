import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Loader } from "@react-three/drei";
import { Toaster } from "sonner";
import { useAudio } from "./lib/stores/useAudio";
import LoadingScreen from "./components/UI/LoadingScreen";
import LunarEnvironment from "./components/LunarEnvironment";
import ControlsHelp from "./components/UI/ControlsHelp";
import "@fontsource/inter";

// Define control keys for navigation
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

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
  
  // Define key mappings
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.up, keys: ['KeyE'] },
    { name: Controls.down, keys: ['KeyQ'] },
  ];
  
  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <KeyboardControls map={keyMap}>
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
                powerPreference: "default"
              }}
            >
              <Suspense fallback={null}>
                <LunarEnvironment />
              </Suspense>
            </Canvas>
            <Loader />
          </KeyboardControls>
          <ControlsHelp />
          <Toaster position="top-right" richColors />
        </>
      )}
    </>
  );
}

export default App;
