import { DragEvent, KeyboardEvent, useRef, useState } from 'react';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropZoneProps {
  onFiles: (files: FileList | null) => void | Promise<void>;
  uploading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ImageDropZone({ onFiles, uploading = false, disabled = false, className }: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDisabled = disabled || uploading;

  const openFilePicker = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled) return;
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDisabled) event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (!isDisabled) void onFiles(event.dataTransfer.files);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="Kéo thả hoặc chọn ảnh xe"
      aria-disabled={isDisabled}
      onClick={openFilePicker}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging
          ? 'scale-[1.02] border-accent bg-accent/10 text-accent shadow-md'
          : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/50 hover:text-primary',
        isDisabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void onFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Đang tải ảnh...</span>
        </>
      ) : isDragging ? (
        <>
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm font-semibold">Thả ảnh vào đây</span>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8" />
          <span className="text-sm font-medium">Kéo thả ảnh</span>
          <span className="text-[11px] text-muted-foreground">hoặc bấm để chọn</span>
        </>
      )}
    </div>
  );
}
