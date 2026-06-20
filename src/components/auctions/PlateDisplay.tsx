import { cn } from '@/lib/utils';

interface PlateDisplayProps {
  plateNumber: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function PlateDisplay({ plateNumber, size = 'md', className }: PlateDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-lg px-4 py-2',
    lg: 'text-2xl px-6 py-3',
    xl: 'text-3xl px-8 py-4',
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-bold tracking-wider",
        "bg-plate-bg text-plate-text border-2 border-plate-border",
        "shadow-lg",
        sizeClasses[size],
        className
      )}
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
        letterSpacing: '0.15em',
      }}
    >
      {plateNumber}
    </div>
  );
}
