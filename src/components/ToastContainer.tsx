import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-full max-w-md">
      {toasts.map((toast) => (
        <div className="pointer-events-auto w-full" key={toast.id}>
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;