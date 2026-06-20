import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ListingType = 'car' | 'plate';
type ContactType = 'phone' | 'zalo' | 'message';

export function useListingAnalytics(listingId: string | undefined, listingType: ListingType) {
  const { user } = useAuth();
  const hasTrackedView = useRef(false);

  // Track view on mount (only once per session)
  useEffect(() => {
    if (!listingId || hasTrackedView.current) return;

    const trackView = async () => {
      try {
        await supabase.from('listing_views').insert({
          listing_id: listingId,
          listing_type: listingType,
          viewer_id: user?.id || null,
        });
        hasTrackedView.current = true;
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Small delay to avoid tracking on quick navigation
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [listingId, listingType, user?.id]);

  const trackContact = async (contactType: ContactType) => {
    if (!listingId) return;

    try {
      await supabase.from('listing_contacts').insert({
        listing_id: listingId,
        listing_type: listingType,
        contact_type: contactType,
        contactor_id: user?.id || null,
      });
    } catch (error) {
      console.error('Error tracking contact:', error);
    }
  };

  return { trackContact };
}
