import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen) {
      dialogNode.showModal();
    } else {
      dialogNode.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="p-0 border border-gray-300 rounded-lg w-full max-w-lg backdrop:bg-black backdrop:bg-opacity-50"
      onCancel={onClose}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 m-0">{title}</h2>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-800"
        >
          &times; {/* A better 'x' icon */}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </dialog>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
