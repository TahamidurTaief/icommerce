"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiX } from "react-icons/fi";

const icons = {
  success: <FiCheckCircle className="text-green-500 text-6xl mb-4" />,
  warning: <FiAlertTriangle className="text-yellow-500 text-6xl mb-4" />,
  error: <FiXCircle className="text-red-500 text-6xl mb-4" />,
};

const buttonClasses = {
  success: "bg-green-500 hover:bg-green-600",
  warning: "bg-yellow-500 hover:bg-yellow-600",
  error: "bg-red-500 hover:bg-red-600",
};

const NotificationModal = ({
  isOpen,
  onClose,
  status = "success",
  title,
  message,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: -20, 
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        duration: 0.5
      },
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.9,
      transition: { duration: 0.3 }
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--color-second-bg)] rounded-xl max-w-sm w-full shadow-2xl relative p-8 text-center"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>

            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15, 
                  delay: 0.2 
                }}
              >
                {icons[status]}
              </motion.div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                {title}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                {message}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {secondaryActionText && (
                  <button
                    onClick={onSecondaryAction || onClose}
                    className="w-full text-center px-6 py-3 bg-[var(--color-border)] text-[var(--color-text-primary)] font-bold rounded-lg hover:opacity-80 transition-opacity"
                  >
                    {secondaryActionText}
                  </button>
                )}
                {primaryActionText && (
                   <button
                    onClick={onPrimaryAction || onClose}
                    className={`w-full text-center px-6 py-3 text-white font-bold rounded-lg transition-opacity ${buttonClasses[status]}`}
                  >
                    {primaryActionText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
