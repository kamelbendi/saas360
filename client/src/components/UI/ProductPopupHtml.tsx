import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, X, Trash2, Flame } from "lucide-react";

interface ProductPopupHtmlProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    founder_twitter?: string;
    author?: string;
    position: number[];
  };
  onClose: () => void;
  onDelete?: () => void;
  onStartBurning?: (productId: number, position: number[]) => void;
}

const ProductPopupHtml = ({ product, onClose, onDelete, onStartBurning }: ProductPopupHtmlProps) => {
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
  
  // Track burning animation state
  const [isBurning, setIsBurning] = useState(false);

  // Handle deleting (burning) product
  const handleDelete = async () => {
    if (isDeleting || isBurning) return; // Prevent multiple clicks
    
    setIsDeleting(true);
    
    try {
      // Start burn animation
      setIsBurning(true);
      
      // Notify parent component to start the burning animation
      if (onStartBurning) {
        onStartBurning(product.id, product.position);
      }
      
      // Only perform the actual deletion after a slight delay to let animation start
      setTimeout(async () => {
        if (onDelete) {
          await onDelete();
        }
        // We don't close the popup right away - animation completion
        // will trigger page reload from the BurningFlag component
      }, 500);
      
    } catch (error) {
      console.error('Failed to delete product:', error);
      setIsDeleting(false);
      setIsBurning(false);
    }
  };
  
  // Function to reload the page when burning completes
  const handleBurnComplete = () => {
    // Page reload when the burning animation is complete
    window.location.reload();
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
  }, []);
  
  // Position in top right corner
  const popupStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000
  } as React.CSSProperties;
  
  return (
    <div style={popupStyle}>
      <div 
        ref={popupRef}
        className={`product-popup ${isVisible ? 'visible' : ''}`}
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)', // Dark background
          color: 'white'
        }}
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
          {/* Display author info if either founder_twitter or author exists */}
          {(product.founder_twitter || product.author) && (
            <div className="founder-section">
              <div className="founder-header">
                {/* X logo SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="twitter-icon">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Founded by:</span>
              </div>
              <div className="founder-profile">
                {/* Use founder_twitter for compatibility, fall back to author */}
                <img 
                  src={`https://unavatar.io/twitter/${product.founder_twitter || product.author}`} 
                  alt={`${product.founder_twitter || product.author}'s profile`} 
                  className="founder-avatar"
                />
                <a 
                  href={`https://twitter.com/${product.founder_twitter || product.author}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="founder-link"
                >
                  @{product.founder_twitter || product.author}
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="popup-footer">
          <button
            onClick={handleDelete}
            className="delete-btn"
            disabled={isDeleting}
            aria-label="Burn product"
          >
            <Flame size={14} />
            <span>{isDeleting ? 'Burning...' : 'Burn 🔥 ($5)'}</span>
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
    </div>
  );
};

export default React.memo(ProductPopupHtml);