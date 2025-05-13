import { useState, useCallback, useEffect } from "react";

interface ContextMenu {
  visible: boolean;
  position: { x: number; y: number };
}

export const useRightClickMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    position: { x: 0, y: 0 }
  });
  
  // Show the context menu
  const showContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
    
    setContextMenu({
      visible: true,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }, []);
  
  // Hide the context menu
  const hideContextMenu = useCallback(() => {
    setContextMenu((prev) => ({
      ...prev,
      visible: false
    }));
  }, []);
  
  // Handle clicks outside to hide the menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        hideContextMenu();
      }
    };
    
    window.addEventListener("click", handleClickOutside);
    
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible, hideContextMenu]);
  
  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
};
