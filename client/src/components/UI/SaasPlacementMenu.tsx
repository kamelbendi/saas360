import React from "react";
import { createPortal } from "react-dom";

interface SaasPlacementMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onAddProduct: () => void;
}

const SaasPlacementMenu = ({ position, onClose, onAddProduct }: SaasPlacementMenuProps) => {
  // Create a reference to prevent event propagation
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ 
        top: position.y, 
        left: position.x 
      }}
    >
      <div className="flex flex-col space-y-1">
        <button 
          className="text-left w-full px-3 py-2 text-sm rounded hover:bg-primary/20 text-white"
          onClick={onAddProduct}
        >
          Add SaaS Product
        </button>
        <button 
          className="text-left w-full px-3 py-2 text-sm rounded hover:bg-primary/20 text-white"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SaasPlacementMenu;
