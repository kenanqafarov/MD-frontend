import React from 'react';
import '../assets/style/modal.css';

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  cancelText = "İmtina", 
  confirmText = "Təsdiq", 
  onConfirm,
  confirmButtonClass = "confirm-button",
  isAlert = false // New prop with a default value of false
}) {
  if (!isOpen) return null;

  // Modal açıq olanda body scrollunu qadağan etmək
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Modal xaricində klikləndikdə bağlanma
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-content">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-actions">
          {/* Conditionally render the cancel button */}
          {!isAlert && (
            <button className="cancel-button" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button 
            className={confirmButtonClass} 
            onClick={() => {
              // Only call onConfirm if it exists and is not an alert modal
              if (onConfirm && !isAlert) {
                onConfirm();
              }
              onClose();
            }}
          >
            {isAlert ? "Bağla" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;