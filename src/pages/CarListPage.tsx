import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { CarCard } from '@/components/cars/CarCard';
import { FilterBar, FilterValues } from '@/components/cars/FilterBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { ChevronLeft, ChevronRight, Car, Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'year-desc', label: 'Năm sản xuất mới nhất' },
  { value: 'mileage-asc', label: 'Số km thấp nhất' },
];

export type CarListingDB = Tables<'car_listings'>;

export default function CarListPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  
  const [cars, setCars] = useState<CarListingDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    search: initialQuery,
    brand: initialBrand,
    priceMin: initialMinPrice,
    priceMax: initialMaxPrice,
    yearMin: '',
    yearMax: '',
    fuel: '',
    transmission: '',
    province: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch cars from database
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('car_listings')
        .select('*')
        .eq('status', 'active')
        .order('boosted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cars:', error);
      } else {
        setCars(data || []);
      }
      setLoading(false);
    };

    fetchCars();
  }, []);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(car => 
        car.title.toLowerCase().includes(search) ||
        car.brand.toLowerCase().includes(search) ||
        car.model.toLowerCase().includes(search)
      );
    }

    if (filters.brand && filters.brand !== 'all') {
      result = result.filter(car => car.brand === filters.brand);
    }

    if (filters.priceMin) {
      result = result.filter(car => car.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      result = result.filter(car => car.price <= parseInt(filters.priceMax));
    }

    if (filters.yearMin && filters.yearMin !== 'all') {
      result = result.filter(car => car.year >= parseInt(filters.yearMin));
    }

    if (filters.yearMax && filters.yearMax !== 'all') {
      result = result.filter(car => car.year <= parseInt(filters.yearMax));
    }

    if (filters.fuel && filters.fuel !== 'all') {
      result = result.filter(car => car.fuel_type === filters.fuel);
    }

    if (filters.transmission && filters.transmission !== 'all') {
      result = result.filter(car => car.transmission === filters.transmission);
    }

    if (filters.province && filters.province !== 'all') {
      result = result.filter(car => car.location === filters.province);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'mileage-asc':
        result.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [cars, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-secondary/30 py-8">
        <div className="container">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mua xe cũ</h1>
          </div>
          <p className="text-muted-foreground">Tìm kiếm trong {cars.length}+ xe đang bán</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 border-b border-border bg-card py-6 md:top-20">
        <div className="container">
          <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container">
          {/* Results Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">Hiển thị <span className="font-medium text-foreground">{filteredCars.length}</span> kết quả</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedCars.length > 0 ? (
            <div className="car-grid">
              {paginatedCars.map((car, index) => (
                <CarCard key={car.id} car={car} index={index} />
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Car className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Không tìm thấy xe nào
              </h3>
              <p className="text-muted-foreground">
                Thử điều chỉnh bộ lọc để tìm kiếm xe phù hợp hơn
              </p>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
