import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Phone, MessageCircle, Clock, Loader2, Eye, Heart, ZoomIn } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlateDisplay } from '@/components/auctions/PlateDisplay';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { formatFullPrice, formatPrice, formatDate } from '@/lib/mockData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useListingAnalytics } from '@/hooks/useListingAnalytics';
import { useFavorites } from '@/hooks/useFavorites';

type PlateListingDB = Tables<'plate_listings'>;
type ProfileDB = Tables<'profiles'>;

export default function PlateDetailPage() {
  const { id } = useParams();
  const [plate, setPlate] = useState<PlateListingDB | null>(null);
  const [sellerProfile, setSellerProfile] = useState<ProfileDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const { trackContact } = useListingAnalytics(id, 'plate');
  const { isFavorite, toggleFavorite, loading: favoriteLoading } = useFavorites(id, 'plate');

  useEffect(() => {
    const fetchPlate = async () => {
      if (!id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('plate_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching plate:', error);
      } else if (data) {
        setPlate(data);
        
        // Fetch seller profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .maybeSingle();
        
        setSellerProfile(profile);
      }
      setLoading(false);
    };

    fetchPlate();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!plate) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy biển số</h1>
          <Link to="/bien-so">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = plate.images && plate.images.length > 0 ? plate.images : [];

  const handleShowPhone = () => {
    trackContact('phone');
    setShowPhone(true);
  };

  const handleOpenZalo = () => {
    trackContact('message');
    if (sellerProfile?.phone) {
      // Format phone number for Zalo (remove leading 0 and add country code if needed)
      let phone = sellerProfile.phone.replace(/\s+/g, '');
      if (phone.startsWith('0')) {
        phone = '84' + phone.substring(1);
      }
      window.open(`https://zalo.me/${phone}`, '_blank');
    } else {
      toast.error('Người bán chưa cập nhật số điện thoại');
    }
  };

  const getStatusBadge = () => {
    switch (plate.status) {
      case 'active':
        return <Badge variant="success" className="px-4 py-1">Đang bán</Badge>;
      case 'sold':
        return <Badge variant="ended" className="px-4 py-1">Đã bán</Badge>;
      default:
        return <Badge variant="secondary" className="px-4 py-1">{plate.status}</Badge>;
    }
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/bien-so" className="hover:text-foreground transition-colors">Biển số đấu giá</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{plate.plate_number}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plate Display Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 text-center">
                <div className="flex justify-center gap-2 mb-6">
                  {getStatusBadge()}
                  <Badge variant="secondary" className="px-4 py-1">
                    {plate.plate_type}
                  </Badge>
                </div>

                <PlateDisplay plateNumber={plate.plate_number} size="xl" className="mb-6" />

                {plate.province && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{plate.province}</span>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Images */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Hình ảnh giấy tờ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div 
                        key={index} 
                        className="aspect-[4/3] rounded-lg overflow-hidden bg-muted cursor-pointer group relative"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <img src={img} alt={`Giấy tờ ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium">
                            <ZoomIn className="w-3 h-3" />
                            Phóng to
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Image Lightbox */}
            <ImageLightbox
              images={images}
              initialIndex={lightboxIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />

            {/* Description */}
            {plate.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Mô tả chi tiết</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {plate.description}
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Auction Info */}
            {plate.starting_price && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Thông tin đấu giá gốc</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground mb-1">Giá trúng đấu giá</p>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(plate.starting_price)}
                      </p>
                    </div>
                    {plate.auction_end_date && (
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground mb-1">Ngày đấu giá</p>
                        <p className="text-lg font-bold">
                          {formatDate(plate.auction_end_date)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6 sticky top-24">
                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b">
                  <p className="text-sm text-muted-foreground">Giá bán</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatFullPrice(plate.price)}
                  </p>
                </div>

                {/* Favorite Button */}
                <div className="mb-6">
                  <Button
                    variant="outline"
                    className={`w-full ${isFavorite ? 'text-destructive border-destructive' : ''}`}
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Đã lưu yêu thích' : 'Lưu tin yêu thích'}
                  </Button>
                </div>

                {/* Contact Buttons */}
                {plate.status === 'active' && (
                  <div className="space-y-3">
                    {showPhone && sellerProfile?.phone ? (
                      <a href={`tel:${sellerProfile.phone}`} className="block">
                        <Button 
                          variant="accent" 
                          className="w-full" 
                          size="lg"
                        >
                          <Phone className="w-5 h-5" />
                          {sellerProfile.phone}
                        </Button>
                      </a>
                    ) : (
                      <Button 
                        variant="accent" 
                        className="w-full" 
                        size="lg"
                        onClick={handleShowPhone}
                      >
                        {showPhone ? (
                          <span className="text-sm text-muted-foreground">Chưa có số điện thoại</span>
                        ) : (
                          <>
                            <Eye className="w-5 h-5" />
                            Hiện số điện thoại
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={handleOpenZalo}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Nhắn tin Zalo
                    </Button>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t flex items-center justify-center text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Đăng: {formatDate(plate.created_at)}
                  </span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
