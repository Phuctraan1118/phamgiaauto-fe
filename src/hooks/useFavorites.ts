import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useFavorites(listingId: string | undefined, listingType: 'car' | 'plate') {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !listingId) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .eq('listing_type', listingType)
        .maybeSingle();

      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [user, listingId, listingType]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu tin yêu thích');
      return;
    }

    if (!listingId) return;

    setLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .eq('listing_type', listingType);

        if (error) throw error;
        setIsFavorite(false);
        toast.success('Đã xóa khỏi tin yêu thích');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId,
            listing_type: listingType,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast.success('Đã lưu vào tin yêu thích');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return { isFavorite, toggleFavorite, loading };
}
