import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Car, 
  Shield, 
  Clock,
  TrendingUp,
  Users,
  ChevronRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CarCard } from '@/components/cars/CarCard';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import homeHeroShowroom from '@/assets/home-hero-showroom.png';

type CarListingDB = Tables<'car_listings'>;

const stats = [
  { label: 'Xe đang bán', value: '12,500+', icon: Car },
  { label: 'Khách hàng', value: '50,000+', icon: Users },
  { label: 'Giao dịch thành công', value: '8,000+', icon: TrendingUp },
];

const features = [
  { 
    title: 'Xe đã kiểm định', 
    description: 'Tất cả xe đều được kiểm tra 150+ hạng mục trước khi đăng bán',
    icon: Shield 
  },
  { 
    title: 'Xe công ty tuyển chọn', 
    description: 'Kho xe được Phạm Gia Auto chọn lọc, có lịch sử rõ ràng và tư vấn minh bạch',
    icon: Car 
  },
  { 
    title: 'Hỗ trợ 24/7', 
    description: 'Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ bạn mọi lúc',
    icon: Clock 
  },
];

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<CarListingDB[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const carsRes = await supabase.from('car_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6);
      
      setFeaturedCars(carsRes.data || []);
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section id="trang-chu" className="relative overflow-visible pb-8 sm:pb-16 scroll-mt-20">
        <img
          src={homeHeroShowroom}
          alt="Showroom xe tuyển chọn của Phạm Gia Auto"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/[0.78]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-secondary/75" />
        <div className="container relative z-10 px-4 py-8 sm:py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Kho xe cũ tuyển chọn <br />
              <span className="text-gradient">từ Phạm Gia Auto</span>
            </motion.h1>
            
            <motion.p 
              className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Website chính thức của công ty mua bán xe cũ uy tín, xe được kiểm tra kỹ và tư vấn minh bạch
            </motion.p>

            {/* Search Component */}
            <motion.div 
              className="max-w-2xl mx-auto relative z-30 px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlobalSearch variant="hero" />
            </motion.div>
          </div>
        </div>

      </section>

      {/* Stats */}
      <section id="ve-chung-toi" className="relative z-0 py-8 sm:py-12 bg-card border-y border-border scroll-mt-20">
        <div className="container px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary mb-2 sm:mb-3">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-8 sm:py-12 md:py-16 bg-secondary/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Xe nổi bật
              </h2>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Những chiếc xe được quan tâm nhất
              </p>
            </div>
            <Link to="/xe" className="flex-shrink-0">
              <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden xs:inline">Xem tất cả xe</span>
                <span className="xs:hidden">Tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="car-grid">
            {featuredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="dich-vu" className="py-8 sm:py-12 md:py-16 scroll-mt-20">
        <div className="container px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-4">
              Tại sao chọn Phạm Gia Automotive?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
              Chúng tôi cam kết mang đến trải nghiệm mua bán xe tốt nhất cho bạn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 h-full text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="thu-mua-xe" className="py-8 sm:py-12 md:py-16 gradient-primary text-primary-foreground scroll-mt-20">
        <div className="container px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">
            Bạn muốn bán xe?
          </h2>
          <p className="text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Gửi thông tin xe hoặc gọi cho Phạm Gia Auto để được kiểm tra, định giá minh bạch và thu mua nhanh chóng
          </p>
          <a href="tel:19001234">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
              Gọi tư vấn thu mua
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>
    </Layout>
  );
}
