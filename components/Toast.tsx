"use client";

import { useEffect, useState } from "react";
import { MdCheckCircle, MdError, MdInfo, MdClose } from "react-icons/md";

export type ToastType = "success" | "error" | "info" | "loading";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      case "loading":
        return "bg-gray-700 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <MdCheckCircle className="text-2xl" />;
      case "error":
        return <MdError className="text-2xl" />;
      case "info":
        return <MdInfo className="text-2xl" />;
      case "loading":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 flex items-center gap-3 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${getToastStyles()}`}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
      >
        <MdClose className="text-xl" />
      </button>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

