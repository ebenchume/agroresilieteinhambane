import React, { useRef, useEffect } from 'react';
import { useOverlay, useDialog, FocusScope } from 'react-aria';
import { X } from 'lucide-react';

export interface AriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  role?: 'dialog' | 'alertdialog';
  showCloseButton?: boolean;
}

export const AriaModal: React.FC<AriaModalProps> = ({
  isOpen,
  onClose,
  title,
  ariaLabel,
  children,
  maxWidth = 'max-w-lg',
  className = '',
  role = 'dialog',
  showCloseButton = true
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // react-aria useOverlay hook for backdrop dismiss and Escape key handling
  const { overlayProps, underlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      isDismissable: true,
      shouldCloseOnBlur: false
    },
    overlayRef
  );

  // react-aria useDialog hook for accessibility attributes (role, aria-labelledby, aria-modal)
  const { dialogProps, titleProps } = useDialog(
    {
      role,
      'aria-label': ariaLabel || title,
    },
    dialogRef
  );

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      {...underlayProps}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto pb-safe animate-in fade-in duration-150"
    >
      <div
        ref={overlayRef}
        {...overlayProps}
        className="w-full flex justify-center py-2 sm:py-6 my-auto"
      >
        <FocusScope contain restoreFocus autoFocus>
          <div
            ref={dialogRef}
            {...dialogProps}
            className={`w-full ${maxWidth} max-h-[90dvh] overflow-y-auto bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-7 relative transition-all duration-150 animate-in zoom-in-95 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accessible Close Button (44x44px minimum touch hitbox) */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3.5 right-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-stone-100 dark:hover:bg-stone-800 z-10"
                aria-label="Fechar janela"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Hidden or visible title hook */}
            {title && (
              <div {...titleProps} className="sr-only">
                {title}
              </div>
            )}

            {children}
          </div>
        </FocusScope>
      </div>
    </div>
  );
};
