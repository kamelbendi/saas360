import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState("Initializing lunar environment");
  const [dots, setDots] = useState("");
  
  // Loading text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Loading messages sequence
  useEffect(() => {
    const messages = [
      "Initializing lunar environment",
      "Calibrating gravity",
      "Rendering lunar surface",
      "Loading SaaS products",
      "Establishing orbital connection"
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full opacity-20"></div>
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-white">Lunar SaaS</h1>
      <p className="text-gray-400">
        {loadingText}{dots}
      </p>
    </div>
  );
};

export default LoadingScreen;
