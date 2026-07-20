import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  maxFiles?: number | null;
  maxSizeMB?: number;
  folder?: string;
}

export function useImageUpload(userId: string | undefined, options: UseImageUploadOptions = {}) {
  const { maxFiles = null, maxSizeMB = 5, folder = 'cars' } = options;
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!userId) {
      toast.error('Vui lòng đăng nhập để upload ảnh');
      return null;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Kích thước ảnh tối đa ${maxSizeMB}MB`);
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error, data } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi upload ảnh. Vui lòng thử lại.');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (maxFiles !== null && images.length + files.length > maxFiles) {
      toast.error(`Tối đa ${maxFiles} ảnh`);
      return;
    }

    setUploading(true);
    const uploadPromises: Promise<string | null>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh');
        continue;
      }
      uploadPromises.push(uploadImage(file));
    }

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((url): url is string => url !== null);

    if (successfulUploads.length > 0) {
      setImages(prev => [...prev, ...successfulUploads]);
      toast.success(`Đã upload ${successfulUploads.length} ảnh`);
    }

    setUploading(false);
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract path from URL
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/listing-images/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from('listing-images').remove([filePath]);
      }
    } catch (e) {
      console.error('Error removing image:', e);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setImages([]);
  };

  return {
    images,
    setImages,
    uploading,
    handleFileSelect,
    removeImage,
    reset,
  };
}
