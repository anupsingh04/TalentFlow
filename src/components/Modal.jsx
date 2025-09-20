import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./Modal.module.css";

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
    <dialog ref={dialogRef} className={styles.modal} onCancel={onClose}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          x
        </button>
      </div>
      <div className={styles.content}>{children}</div>
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
