import React from "react";
import { Html } from "@react-three/drei";
import { ExternalLink, X } from "lucide-react";

interface ProductPopupProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
  };
  position: [number, number, number];
  onClose: () => void;
}

const ProductPopup = ({ product, position, onClose }: ProductPopupProps) => {
  return (
    <Html position={[position[0], position[1] + 3, position[2]]} center>
      <div className="product-popup">
        <div className="popup-header">
          <h3>{product.name}</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="popup-body">
          <p>{product.description}</p>
        </div>
        
        <div className="popup-footer">
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