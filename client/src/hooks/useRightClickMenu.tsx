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
  const showContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    if (!event) {
      console.error('No event provided to showContextMenu');
      return;
    }
    
    // Prevent default context menu
    event.preventDefault();
    
    // Get coordinates (may be in different places depending on event type)
    let x = 0, y = 0;
    
    // Standard browser event
    if ('clientX' in event && 'clientY' in event) {
      x = event.clientX;
      y = event.clientY;
    }
    
    setContextMenu({
      visible: true,
      position: { x, y }
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
