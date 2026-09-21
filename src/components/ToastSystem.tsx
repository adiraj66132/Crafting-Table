import React, { useEffect, useState } from 'react';
import { ItemSprite } from './ItemSprite';
import { sound } from '../utils/audio';

export interface ToastMessage {
  id: string;
  type?: 'advancement' | 'info' | 'success' | 'warning';
  title: string;
  description: string;
  itemId?: string;
  duration?: number;
}

// Global emitter event for toasts
type ToastListener = (toast: ToastMessage) => void;
const listeners: ToastListener[] = [];
let toastSeq = 0;

export const showToast = (toast: Omit<ToastMessage, 'id'>) => {
  const toastWithId: ToastMessage = {
    ...toast,
    id: `toast-${Date.now()}-${toastSeq++}`,
    duration: toast.duration || 3500,
  };
  listeners.forEach((l) => l(toastWithId));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    let mounted = true;
    const timers: number[] = [];
    const handleAdd = (toast: ToastMessage) => {
      if (!mounted) return;
      setToasts((prev) => [...prev, toast]);
      if (toast.type === 'advancement') {
        sound.playLevelUp();
      } else {
        sound.playPop();
      }

      timers.push(
        window.setTimeout(() => {
          if (mounted) setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration || 3500)
      );
    };

    listeners.push(handleAdd);
    return () => {
      mounted = false;
      timers.forEach(clearTimeout);
      const idx = listeners.indexOf(handleAdd);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:w-full sm:max-w-sm z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          className="pointer-events-auto cursor-pointer bg-[#292929] border-2 border-[#454545] border-t-[#5c5c5c] border-l-[#5c5c5c] border-r-[#181818] border-b-[#181818] rounded-xs p-3 shadow-[0_8px_24px_rgba(0,0,0,0.85),0_4px_0_#141414] flex items-center gap-3 animate-fadeIn transform transition-all hover:scale-102"
        >
          {/* Item or Trophy Icon */}
          <div className="minecraft-slot w-11 h-11 flex items-center justify-center shrink-0 rounded-xs shadow-[inset_1px_1px_3px_rgba(0,0,0,0.7)]">
            {toast.itemId ? (
              <ItemSprite id={toast.itemId} size="md" />
            ) : (
              <div className="w-6 h-6 bg-[#F2C94C] rounded-xs flex items-center justify-center text-black font-pixel text-xs font-bold shadow-xs">
                ★
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="font-pixel text-[10px] tracking-wider uppercase text-[#F2C94C] flex items-center gap-1">
              <span>{toast.title}</span>
            </div>
            <p className="font-heading text-xs font-semibold text-[#F1F1F1] truncate mt-0.5">
              {toast.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
