'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

interface DropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  triggerLabel?: string;
  className?: string;
}

export default function Dropdown<T extends string>({
  options,
  value,
  onChange,
  triggerLabel,
  className
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="focus-ring flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-sm font-medium text-ink hover:bg-surface-shell"
      >
        {triggerLabel ?? current?.label}
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full min-w-[10rem] overflow-hidden rounded-2xl border border-surface-shell bg-white py-1 shadow-card"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={clsx(
                  'focus-ring block w-full px-4 py-2 text-left text-sm hover:bg-surface-muted',
                  option.value === value ? 'font-semibold text-accent' : 'text-ink'
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
