import { useToast as useToastContext } from '../contexts/ToastContext';

export function useToast() {
  const toast = useToastContext();
  
  return {
    ...toast,
    success: (message: string, duration?: number) => toast.showToast('success', message, duration),
    error: (message: string, duration?: number) => toast.showToast('error', message, duration),
    warning: (message: string, duration?: number) => toast.showToast('warning', message, duration),
    info: (message: string, duration?: number) => toast.showToast('info', message, duration),
  };
}

export default useToast;