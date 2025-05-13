import React, { useState, useEffect } from "react";

const FloatingTitle = () => {
  const [visible, setVisible] = useState(true);
  
  // Hide title after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="floating-title">
      <h1>saas360.space</h1>
      <p>Right-click on the surface to add your SaaS product</p>
    </div>
  );
};

export default FloatingTitle;