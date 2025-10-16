import React from 'react';

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

const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  return (
    <div className="dialog-container">
      {children}
    </div>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => {
  return <>{children}</>;
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
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
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };

