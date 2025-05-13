// This hook is now deprecated as the context menu state is managed by useLunarStore
// This file is kept for backward compatibility during the migration

import { useCallback } from "react";
import { useLunarStore } from "../lib/stores/useLunarStore";

export const useRightClickMenu = () => {
  const { 
    contextMenuVisible, 
    contextMenuPosition, 
    showContextMenu: showMenu, 
    hideContextMenu 
  } = useLunarStore();
  
  // Show the context menu (legacy adapter)
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
    
    showMenu({ x, y });
  }, [showMenu]);
  
  // Return a compatible API with the old implementation
  return {
    contextMenu: {
      visible: contextMenuVisible,
      position: contextMenuPosition
    },
    showContextMenu,
    hideContextMenu
  };
};
