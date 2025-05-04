import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType, useToast } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { hideToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300); // Start exit animation before actual removal
      
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      hideToast(toast.id);
    }, 300);
  };
  
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return null;
    }
  };
  
  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800/60';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800/60';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/60';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800/60';
      default:
        return 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/60';
    }
  };
  
  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-amber-800 dark:text-amber-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <div 
      className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${getBgColor()} transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className={`ml-3 w-0 flex-1 ${getTextColor()}`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`rounded-md inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={handleClose}
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;