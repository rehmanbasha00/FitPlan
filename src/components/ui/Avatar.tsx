import Image from 'next/image';
import clsx from 'clsx';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

// Shown for every account until the user uploads their own profile photo
// (avatarUrl starts out empty for new accounts).
const DEFAULT_AVATAR = '/default-avatar.svg';

export default function Avatar({ src, alt, size = 36, ring = true, className }: AvatarProps) {
  return (
    <span
      className={clsx(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-muted text-xs text-ink-soft',
        ring && 'ring-2 ring-white',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image src={src && src.trim() ? src : DEFAULT_AVATAR} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}
