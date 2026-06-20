import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight, TrendingUp, DollarSign, ChevronDown, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type CarListingDB = Tables<'car_listings'>;

interface GlobalSearchProps {
  className?: string;
  variant?: 'hero' | 'compact';
}

const formatPrice = (price: number) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`;
  }
  return `${(price / 1000000).toFixed(0)} triệu`;
};

const popularSearches = [
  { label: 'Toyota' },
  { label: 'Honda' },
  { label: 'Mercedes' },
  { label: 'BMW' },
];

const priceRanges = [
  { label: 'Tất cả giá', min: null, max: null },
  { label: 'Dưới 100 triệu', min: null, max: 100000000 },
  { label: '100 - 500 triệu', min: 100000000, max: 500000000 },
  { label: '500 triệu - 1 tỷ', min: 500000000, max: 1000000000 },
  { label: '1 tỷ - 2 tỷ', min: 1000000000, max: 2000000000 },
  { label: '2 tỷ - 3 tỷ', min: 2000000000, max: 3000000000 },
  { label: '3 tỷ - 5 tỷ', min: 3000000000, max: 5000000000 },
  { label: 'Trên 5 tỷ', min: 5000000000, max: null },
];

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;
const MAX_CACHE_ENTRIES = 30;

export function GlobalSearch({ className, variant = 'hero' }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null; label: string }>({ min: null, max: null, label: 'Tất cả giá' });
  const [pricePopoverOpen, setPricePopoverOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carResults, setCarResults] = useState<CarListingDB[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchCacheRef = useRef(new Map<string, CarListingDB[]>());
  const requestIdRef = useRef(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const normalizedQuery = query.trim();
    const hasPriceFilter = priceRange.min !== null || priceRange.max !== null;

    if (!hasPriceFilter && normalizedQuery.length < MIN_SEARCH_LENGTH) {
      requestIdRef.current += 1;
      setCarResults([]);
      setLoading(false);
      return;
    }

    const cacheKey = `${normalizedQuery.toLocaleLowerCase('vi')}|${priceRange.min ?? ''}|${priceRange.max ?? ''}`;
    const cachedResults = searchCacheRef.current.get(cacheKey);
    if (cachedResults) {
      setCarResults(cachedResults);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let carQuery = supabase
          .from('car_listings')
          .select('*')
          .eq('status', 'active');
        
        if (normalizedQuery) {
          carQuery = carQuery.or(`title.ilike.%${normalizedQuery}%,brand.ilike.%${normalizedQuery}%,model.ilike.%${normalizedQuery}%`);
        }
        if (priceRange.min !== null) {
          carQuery = carQuery.gte('price', priceRange.min);
        }
        if (priceRange.max !== null) {
          carQuery = carQuery.lte('price', priceRange.max);
        }
        carQuery = carQuery
          .order('boosted_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(5)
          .abortSignal(controller.signal);

        const carsRes = await carQuery;
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        if (carsRes.error) throw carsRes.error;

        const results = (carsRes.data || []) as CarListingDB[];
        if (searchCacheRef.current.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = searchCacheRef.current.keys().next().value;
          if (oldestKey) searchCacheRef.current.delete(oldestKey);
        }
        searchCacheRef.current.set(cacheKey, results);
        setCarResults(results);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Search error:', error);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, priceRange]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query);
    }
    if (priceRange.min !== null) {
      params.set('minPrice', priceRange.min.toString());
    }
    if (priceRange.max !== null) {
      params.set('maxPrice', priceRange.max.toString());
    }
    
    navigate(`/xe?${params.toString()}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleCarClick = (carId: string) => {
    navigate(`/xe/${carId}`);
    setIsOpen(false);
    setQuery('');
  };

  const handlePopularSearch = (search: { label: string }) => {
    setQuery(search.label);
    inputRef.current?.focus();
  };

  const hasResults = carResults.length > 0;
  const normalizedQuery = query.trim();
  const hasPriceFilter = priceRange.min !== null || priceRange.max !== null;
  const waitingForMoreCharacters = normalizedQuery.length > 0 && normalizedQuery.length < MIN_SEARCH_LENGTH && !hasPriceFilter;
  const canShowResults = normalizedQuery.length >= MIN_SEARCH_LENGTH || hasPriceFilter;
  const showDropdown = isOpen;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Nhập tên xe, hãng, model..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              'pl-9 sm:pl-12 pr-10 text-sm sm:text-base rounded-xl border-2 border-border focus:border-primary transition-all',
              variant === 'hero' ? 'h-11 sm:h-14' : 'h-10 sm:h-12'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {loading && (
            <div className="absolute right-8 sm:right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Price Filter */}
          <Popover open={pricePopoverOpen} onOpenChange={setPricePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'gap-1 sm:gap-2 rounded-xl border-2 font-medium whitespace-nowrap flex-1 sm:flex-none',
                  variant === 'hero' ? 'h-11 sm:h-14 px-3 sm:px-4' : 'h-10 sm:h-12 px-2 sm:px-3',
                  priceRange.min !== null || priceRange.max !== null
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border'
                )}
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">{priceRange.label}</span>
                <span className="sm:hidden text-xs">Giá</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setPriceRange({ min: range.min, max: range.max, label: range.label });
                      setPricePopoverOpen(false);
                      setIsOpen(true);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      priceRange.label === range.label
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            variant="hero" 
            size={variant === 'hero' ? 'xl' : 'lg'} 
            className={cn(
              variant === 'hero' ? 'h-11 sm:h-14' : 'h-10 sm:h-12', 
              'whitespace-nowrap flex-1 sm:flex-none px-3 sm:px-6'
            )}
            onClick={handleSearch}
          >
            <span className="hidden sm:inline">Tìm kiếm</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-40"
          >
            {/* Loading State */}
            {loading && query.trim() && (
              <div className="flex items-center justify-center p-6 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tìm kiếm...</span>
              </div>
            )}

            {/* No Query - Show Popular Searches */}
            {!query.trim() && !priceRange.min && !priceRange.max && (
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Tìm kiếm phổ biến</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search.label}
                      onClick={() => handlePopularSearch(search)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg text-sm transition-colors"
                    >
                      <Car className="w-3 h-3 text-primary" />
                      {search.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {waitingForMoreCharacters && (
              <div className="flex items-center gap-3 p-4 text-left text-sm text-muted-foreground">
                <Search className="h-5 w-5 shrink-0 text-primary" />
                <span>Nhập thêm ít nhất 1 ký tự để xem gợi ý xe.</span>
              </div>
            )}
            
            {/* Price Filter Active */}
            {(priceRange.min !== null || priceRange.max !== null) && !query.trim() && !loading && (
              <div className="p-3 border-b border-border flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  {priceRange.label}
                  <button 
                    onClick={() => setPriceRange({ min: null, max: null, label: 'Tất cả giá' })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}

            {/* Results */}
            {!loading && canShowResults && (
              <>
                {/* Car Results */}
                {carResults.length > 0 && (
                  <div className="border-b border-border">
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Xe ({carResults.length})</span>
                    </div>
                    <div className="divide-y divide-border">
                      {carResults.map((car) => (
                        <button
                          key={car.id}
                          onClick={() => handleCarClick(car.id)}
                          className="w-full flex items-center gap-4 p-3 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            <img
                              src={car.images?.[0] || '/placeholder.svg'}
                              alt={car.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{car.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {car.year} • {car.location || 'Chưa cập nhật'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatPrice(Number(car.price))}</p>
                            {car.boosted_at && (
                              <Badge variant="outline" className="text-xs border-accent text-accent">
                                Top
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!hasResults && (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Không tìm thấy kết quả cho "<span className="text-foreground font-medium">{query}</span>"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                )}

                {/* View All Button */}
                {hasResults && (
                  <div className="p-3 bg-secondary/30 border-t border-border">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center gap-2" 
                      onClick={handleSearch}
                    >
                      Xem tất cả kết quả
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
