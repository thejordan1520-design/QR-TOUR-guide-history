import React, { useEffect, useRef } from 'react';

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  return (
    <div className="dialog-container" data-dialog-open={open} onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => {
  return <>{children}</>;
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const dialogContainer = dialogRef.current?.closest('.dialog-container');
        if (dialogContainer) {
          dialogContainer.click();
        }
      }
    };

    if (dialogRef.current) {
      document.addEventListener('keydown', handleKeyDown);
      dialogRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const dialogContainer = dialogRef.current?.closest('.dialog-container');
          if (dialogContainer) {
            dialogContainer.click();
          }
        }
      }}
    >
      <div 
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6 focus:outline-none"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
};

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex justify-end space-x-2 mt-6 ${className}`}>
      {children}
    </div>
  );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter };
