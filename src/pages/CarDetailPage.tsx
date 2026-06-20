import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Users,
  Palette,
  Globe,
  CheckCircle,
  Phone,
  MessageCircle,
  CalendarDays,
  Share2,
  Heart,
  Loader2,
  Eye,
  ZoomIn
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CarCard } from '@/components/cars/CarCard';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { formatFullPrice, formatMileage, formatDate } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useListingAnalytics } from '@/hooks/useListingAnalytics';
import { useFavorites } from '@/hooks/useFavorites';

type CarListingDB = Tables<'car_listings'>;
type ProfileDB = Tables<'profiles'>;

export default function CarDetailPage() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [car, setCar] = useState<CarListingDB | null>(null);
  const [sellerProfile, setSellerProfile] = useState<ProfileDB | null>(null);
  const [similarCars, setSimilarCars] = useState<CarListingDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const { trackContact } = useListingAnalytics(id, 'car');
  const { isFavorite, toggleFavorite, loading: favoriteLoading } = useFavorites(id, 'car');

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('car_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching car:', error);
      } else if (data) {
        setCar(data);
        
        // Fetch seller profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .maybeSingle();
        
        setSellerProfile(profile);
        
        // Fetch similar cars
        const { data: similar } = await supabase
          .from('car_listings')
          .select('*')
          .eq('brand', data.brand)
          .eq('status', 'active')
          .neq('id', id)
          .limit(3);
        
        setSimilarCars(similar || []);
      }
      setLoading(false);
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy xe</h1>
          <Link to="/xe">
            <Button>Quay lại danh sách xe</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : ['/placeholder.svg'];

  const specs = [
    { label: 'Năm sản xuất', value: car.year.toString(), icon: Calendar },
    { label: 'Số km', value: car.mileage ? formatMileage(car.mileage) : 'N/A', icon: Gauge },
    { label: 'Nhiên liệu', value: car.fuel_type || 'N/A', icon: Fuel },
    { label: 'Hộp số', value: car.transmission || 'N/A', icon: Settings },
    { label: 'Số chỗ', value: car.seats ? `${car.seats} chỗ` : 'N/A', icon: Users },
    { label: 'Màu sắc', value: car.color || 'N/A', icon: Palette },
    { label: 'Xuất xứ', value: car.origin || 'N/A', icon: Globe },
    { label: 'Vị trí', value: car.location || 'N/A', icon: MapPin },
  ];

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
      toast({ title: 'Lỗi', description: 'Người bán chưa cập nhật số điện thoại', variant: 'destructive' });
    }
  };

  const handleSchedule = () => {
    trackContact('message');
    toast({ title: 'Yêu cầu đặt lịch đã được gửi!', description: 'Chức năng này đang được phát triển' });
  };

  return (
    <Layout>
      <div className="bg-secondary/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Trang chủ</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/xe" className="hover:text-foreground">Mua xe</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-foreground">{car.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 pb-28 lg:pb-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="group relative aspect-[16/10] cursor-pointer bg-secondary" onClick={() => setLightboxOpen(true)}>
                <motion.img key={currentImageIndex} src={images[currentImageIndex]} alt={car.title} className="h-full w-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100"><ZoomIn className="h-4 w-4" />Click để phóng to</div>
                </div>
                {images.length > 1 && <>
                  <button onClick={(event) => { event.stopPropagation(); setCurrentImageIndex(previous => previous === 0 ? images.length - 1 : previous - 1); }} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 hover:bg-background"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={(event) => { event.stopPropagation(); setCurrentImageIndex(previous => previous === images.length - 1 ? 0 : previous + 1); }} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 hover:bg-background"><ChevronRight className="h-5 w-5" /></button>
                </>}
                <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1 text-sm">{currentImageIndex + 1} / {images.length}</div>
              </div>
              {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-4 scrollbar-thin">
                {images.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${index === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}
              </div>}
            </Card>

            <ImageLightbox images={images} initialIndex={currentImageIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />

            <div className="lg:hidden">
              <h1 className="mb-2 text-2xl font-bold text-foreground">{car.title}</h1>
              <p className="mb-4 text-3xl font-bold text-primary">{formatFullPrice(car.price)}</p>
            </div>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Thông số kỹ thuật</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {specs.map(spec => <div key={spec.label} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"><spec.icon className="mt-0.5 h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">{spec.label}</p><p className="font-medium text-foreground">{spec.value}</p></div></div>)}
              </div>
            </Card>

            {car.features && car.features.length > 0 && <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Trang bị & Tiện nghi</h2>
              <div className="flex flex-wrap gap-2">{car.features.map(feature => <Badge key={feature} variant="secondary" className="px-3 py-1.5"><CheckCircle className="mr-1 h-3 w-3 text-success" />{feature}</Badge>)}</div>
            </Card>}

            {car.description && <Card className="p-6"><h2 className="mb-4 text-lg font-semibold text-foreground">Mô tả chi tiết</h2><p className="whitespace-pre-line text-muted-foreground">{car.description}</p></Card>}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 hidden p-6 lg:block">
              <h1 className="mb-2 text-xl font-bold text-foreground">{car.title}</h1>
              <p className="mb-4 text-3xl font-bold text-primary">{formatFullPrice(car.price)}</p>
              <div className="mb-6 flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleFavorite} disabled={favoriteLoading} className={isFavorite ? 'border-destructive text-destructive' : ''}><Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-5 w-5" /></Button>
              </div>
              <div className="space-y-3">
                {showPhone && sellerProfile?.phone ? <a href={`tel:${sellerProfile.phone}`} className="block"><Button variant="hero" className="w-full" size="lg"><Phone className="h-5 w-5" />{sellerProfile.phone}</Button></a> : <Button variant="hero" className="w-full" size="lg" onClick={handleShowPhone}>{showPhone ? <span className="text-sm">Chưa có số điện thoại</span> : <><Eye className="h-5 w-5" />Hiện số điện thoại</>}</Button>}
                <Button variant="outline-primary" className="w-full" size="lg" onClick={handleOpenZalo}><MessageCircle className="h-5 w-5" />Nhắn tin Zalo</Button>
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" className="w-full" size="lg"><CalendarDays className="h-5 w-5" />Đặt lịch xem xe</Button></DialogTrigger>
                  <DialogContent><DialogHeader><DialogTitle>Đặt lịch xem xe</DialogTitle></DialogHeader><form className="space-y-4 pt-4" onSubmit={(event) => { event.preventDefault(); handleSchedule(); }}><Input placeholder="Họ và tên" /><Input placeholder="Số điện thoại" type="tel" /><Input type="date" /><Textarea placeholder="Ghi chú (không bắt buộc)" /><Button type="submit" className="w-full">Gửi yêu cầu</Button></form></DialogContent>
                </Dialog>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">Đăng ngày {formatDate(car.created_at)}</p>
            </Card>
          </div>
        </div>

        {similarCars.length > 0 && <section className="mt-16"><h2 className="mb-6 text-2xl font-bold text-foreground">Xe tương tự</h2><div className="car-grid">{similarCars.map((similarCar, index) => <CarCard key={similarCar.id} car={similarCar} index={index} />)}</div></section>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 lg:hidden">
        <div className="flex gap-3">
          {showPhone && sellerProfile?.phone ? <a href={`tel:${sellerProfile.phone}`} className="flex-1"><Button variant="hero" className="w-full" size="lg"><Phone className="h-5 w-5" />{sellerProfile.phone}</Button></a> : <Button variant="hero" className="flex-1" size="lg" onClick={handleShowPhone}>{showPhone ? 'Chưa có SĐT' : <><Eye className="h-5 w-5" />Hiện SĐT</>}</Button>}
          <Button variant="outline-primary" className="flex-1" size="lg" onClick={handleOpenZalo}><MessageCircle className="h-5 w-5" />Zalo</Button>
        </div>
      </div>
    </Layout>
  );
}
