import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { PlateCard } from '@/components/auctions/PlateCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { provinces } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { CreditCard, Search, PlusCircle, Loader2 } from 'lucide-react';

type PlateListingDB = Tables<'plate_listings'>;

export default function PlateListPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  
  const [plates, setPlates] = useState<PlateListingDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [vehicleType, setVehicleType] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [customMinPrice, setCustomMinPrice] = useState(initialMinPrice);
  const [customMaxPrice, setCustomMaxPrice] = useState(initialMaxPrice);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch plates from database
  useEffect(() => {
    const fetchPlates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('plate_listings')
        .select('*')
        .eq('status', 'active')
        .order('boosted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching plates:', error);
      } else {
        setPlates(data || []);
      }
      setLoading(false);
    };

    fetchPlates();
  }, []);

  const filteredPlates = useMemo(() => {
    let result = [...plates];
    
    // Search
    if (searchQuery) {
      result = result.filter(p => 
        p.plate_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Province filter
    if (provinceFilter !== 'all') {
      result = result.filter(p => p.province === provinceFilter);
    }
    
    // Vehicle type filter
    if (vehicleType !== 'all') {
      result = result.filter(p => p.plate_type === vehicleType);
    }
    
    // Custom price filter from URL params
    if (customMinPrice || customMaxPrice) {
      const minP = customMinPrice ? Number(customMinPrice) : 0;
      const maxP = customMaxPrice ? Number(customMaxPrice) : Infinity;
      result = result.filter(p => p.price >= minP && p.price <= maxP);
    } else if (priceFilter !== 'all') {
      // Standard price filter
      const [min, max] = priceFilter.split('-').map(Number);
      result = result.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max;
        }
        return p.price >= min;
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return result;
  }, [plates, searchQuery, provinceFilter, vehicleType, priceFilter, customMinPrice, customMaxPrice, sortBy]);

  const stats = {
    total: plates.length,
    active: plates.filter(p => p.status === 'active').length,
  };

  return (
    <Layout>
      <section className="bg-secondary/30 py-8">
        <div className="container">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Biển số đấu giá</h1>
            </div>
            <Link to="/dang-tin-bien-so">
              <Button variant="accent">
                <PlusCircle className="w-4 h-4" />
                Đăng bán biển số
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Mua bán biển số xe đã trúng đấu giá từ Bộ Công an • {stats.active} biển đang rao bán
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo số biển (vd: 888, 666...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-border bg-card sticky top-16 md:top-20 z-40">
        <div className="container">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tỉnh/Thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
                {provinces.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Ô tô">Ô tô</SelectItem>
                <SelectItem value="Xe máy">Xe máy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Khoảng giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức giá</SelectItem>
                <SelectItem value="0-100000000">Dưới 100 triệu</SelectItem>
                <SelectItem value="100000000-500000000">100 - 500 triệu</SelectItem>
                <SelectItem value="500000000-1000000000">500 triệu - 1 tỷ</SelectItem>
                <SelectItem value="1000000000-">Trên 1 tỷ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">
            Hiển thị <strong>{filteredPlates.length}</strong> kết quả
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPlates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlates.map((plate, index) => (
                <PlateCard key={plate.id} plate={plate} index={index} />
              ))}
            </div>
          ) : (
            <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Không tìm thấy biển số nào</h3>
              <p className="text-muted-foreground">Thử điều chỉnh bộ lọc để xem các biển số khác</p>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
