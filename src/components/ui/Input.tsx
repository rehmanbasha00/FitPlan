'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.36 5.15A10.9 10.9 0 0 1 12 4.8c6.5 0 10.5 7.2 10.5 7.2a17.4 17.4 0 0 1-3.98 4.86M6.1 6.6C3.36 8.36 1.5 11.4 1.5 12c0 0 4 7.2 10.5 7.2 1.36 0 2.6-.28 3.7-.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={clsx(
              'focus-ring h-11 w-full rounded-2xl border border-surface-shell bg-surface-muted px-4 text-sm text-ink placeholder:text-ink-soft/70',
              isPassword && 'pr-11',
              error && 'border-red-400',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="focus-ring absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-ink-soft transition hover:text-ink"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error}
        className={clsx(
          'focus-ring min-h-[90px] rounded-2xl border border-surface-shell bg-surface-muted px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
