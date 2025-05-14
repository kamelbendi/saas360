import React, { useState, useEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import { ExternalLink, X, Trash2 } from "lucide-react";
import { useSupabaseProducts } from "../../hooks/useSupabaseProducts";

interface ProductPopupProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
  };
  position: [number, number, number];
  onClose: () => void;
  onDelete?: () => void;
}

const ProductPopup = ({ product, position, onClose, onDelete }: ProductPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Animation effect on mount
  useEffect(() => {
    // Short delay to trigger animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };
  
  // Handle delete product
  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to delete product:', error);
      setIsDeleting(false);
    }
  };
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <Html position={[position[0], position[1] + 3, position[2]]} center>
      <div 
        ref={popupRef}
        className={`product-popup ${isVisible ? 'visible' : ''}`}
      >
        <div className="popup-glow"></div>
        <div className="popup-header">
          <h3>{product.name}</h3>
          <button 
            className="close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="popup-body">
          <p>{product.description}</p>
        </div>
        
        <div className="popup-footer">
          <button
            onClick={handleDelete}
            className="delete-btn"
            disabled={isDeleting}
            aria-label="Delete product"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
          
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="visit-link"
          >
            <span>Visit</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </Html>
  );
};

export default ProductPopup;