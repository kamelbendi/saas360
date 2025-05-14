import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, X, Trash2, Flame } from "lucide-react";

interface ProductPopupHtmlProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    founder_twitter?: string;
  };
  onClose: () => void;
  onDelete?: () => void;
}

const ProductPopupHtml = ({ product, onClose, onDelete }: ProductPopupHtmlProps) => {
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
          {product.founder_twitter && (
            <div className="founder-section">
              <div className="founder-header">
                {/* X logo SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="twitter-icon">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Founded by:</span>
              </div>
              <div className="founder-profile">
                <img 
                  src={`https://unavatar.io/twitter/${product.founder_twitter}`} 
                  alt={`${product.founder_twitter}'s profile`} 
                  className="founder-avatar"
                />
                <a 
                  href={`https://twitter.com/${product.founder_twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="founder-link"
                >
                  @{product.founder_twitter}
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