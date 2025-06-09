import { useEffect } from "react";

// Simple counter for modal tracking - sometimes the simplest solution is the best
let openModalCount = 0;

/**
 * Generic hook to manage blur effect for any modal
 * @param {boolean} isOpen - Whether the modal is open
 */
export const useModalBlur = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Increment counter and show backdrop
      openModalCount++;
      
      let backdrop = document.getElementById('modal-backdrop');
      
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 40;
          pointer-events: none;
        `;
        document.body.appendChild(backdrop);
      }
      
      backdrop.style.display = 'block';
    } else {
      // Decrement counter and hide backdrop if no modals left
      openModalCount = Math.max(0, openModalCount - 1);
      
      if (openModalCount === 0) {
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
          backdrop.style.display = 'none';
        }
      }
    }

    // Cleanup function when component unmounts
    return () => {
      if (isOpen) {
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0) {
          const backdrop = document.getElementById('modal-backdrop');
          if (backdrop) {
            backdrop.style.display = 'none';
          }
        }
      }
    };
  }, [isOpen]);
};
