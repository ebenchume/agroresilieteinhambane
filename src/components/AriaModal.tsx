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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={overlayRef}
        {...overlayProps}
        className="w-full flex justify-center py-6 sm:py-10"
      >
        <FocusScope contain restoreFocus autoFocus>
          <div
            ref={dialogRef}
            {...dialogProps}
            className={`w-full ${maxWidth} bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 relative transition-all duration-200 animate-in zoom-in-95 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accessible Close Button */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-stone-100 dark:hover:bg-stone-800"
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
