import React, { useState, useEffect } from "react";
import { Keyboard, MousePointer, Info } from "lucide-react";

const ControlsHelp = () => {
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);
  
  // Auto-hide controls after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimized(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div 
      className="controls-help"
      style={{ opacity: minimized ? 0.3 : 1 }}
      onMouseEnter={() => setMinimized(false)}
      onMouseLeave={() => setMinimized(true)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Info size={16} className="mr-2" />
          <h3 className="font-bold">Controls</h3>
        </div>
        <button 
          className="text-xs text-gray-400 hover:text-white"
          onClick={() => setVisible(false)}
        >
          Hide
        </button>
      </div>
      
      <div className="text-sm space-y-2 text-gray-300">
        <div className="flex items-start">
          <Keyboard size={14} className="mr-2 mt-1 flex-shrink-0" />
          <div>
            <p><span className="text-white">W/A/S/D or Arrows:</span> Move camera</p>
            <p><span className="text-white">E/Q:</span> Move up/down</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <MousePointer size={14} className="mr-2 mt-1 flex-shrink-0" />
          <div>
            <p><span className="text-white">Left Click + Drag:</span> Rotate view</p>
            <p><span className="text-white">Right Click:</span> Place SaaS product</p>
            <p><span className="text-white">Left Click on Product:</span> View details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsHelp;
