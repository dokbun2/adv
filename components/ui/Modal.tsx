
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}

export const Modal: React.FC<ModalProps & { icon?: React.ComponentType<{ className?: string }> }> = ({ isOpen, onClose, children, title, className = 'max-w-2xl', icon: Icon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div
        className={`bg-black/90 backdrop-blur-xl border border-white/[0.05] rounded-2xl shadow-2xl w-full ${className} overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-white/[0.04] rounded-lg">
                <Icon className="w-5 h-5 text-white/70" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3 overflow-y-auto" style={{maxHeight: '70vh'}}>
          {children}
        </div>
      </div>
    </div>
  );
};
