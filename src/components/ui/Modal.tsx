'use client';

import { PropsWithChildren, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  widthClass?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  widthClass = 'max-w-lg',
  children
}: PropsWithChildren<ModalProps>) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`focus-ring relative z-10 w-full ${widthClass} max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-card`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
