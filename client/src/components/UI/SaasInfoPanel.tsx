import React from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";

interface SaasInfoPanelProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
  };
  onClose: () => void;
}

const SaasInfoPanel = ({ product, onClose }: SaasInfoPanelProps) => {
  return createPortal(
    <div className="lunar-ui">
      <div className="fixed top-5 right-5 info-panel w-80">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-white">{product.name}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted/50"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="my-2 text-sm text-gray-200">
          {product.description}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <a 
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
          >
            <span>Visit Website</span>
            <ExternalLink size={14} />
          </a>
          
          <div className="text-xs text-gray-400">
            ID: {product.id}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaasInfoPanel;
