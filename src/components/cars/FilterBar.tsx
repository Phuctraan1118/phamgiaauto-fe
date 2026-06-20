import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { carBrands, provinces } from '@/lib/mockData';

interface FilterBarProps {
  onFilterChange?: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
}

export interface FilterValues {
  search: string;
  brand: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  fuel: string;
  transmission: string;
  province: string;
}

const defaultFilters: FilterValues = {
  search: '',
  brand: '',
  priceMin: '',
  priceMax: '',
  yearMin: '',
  yearMax: '',
  fuel: '',
  transmission: '',
  province: '',
};

const priceRanges = [
  { label: 'Dưới 300 triệu', min: '0', max: '300000000' },
  { label: '300 - 500 triệu', min: '300000000', max: '500000000' },
  { label: '500 - 800 triệu', min: '500000000', max: '800000000' },
  { label: '800 triệu - 1 tỷ', min: '800000000', max: '1000000000' },
  { label: '1 - 2 tỷ', min: '1000000000', max: '2000000000' },
  { label: 'Trên 2 tỷ', min: '2000000000', max: '' },
];

const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

export function FilterBar({ onFilterChange, initialFilters }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>(() => ({ ...defaultFilters, ...initialFilters }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (patch: Partial<FilterValues>) => {
    const newFilters = { ...filters, ...patch };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    updateFilters({ [key]: value });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const selectedPriceRange = priceRanges.find(
    range => range.min === filters.priceMin && range.max === filters.priceMax,
  )?.label || 'all';

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, hãng, model..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="lg"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filters.brand || 'all'} onValueChange={(v) => handleFilterChange('brand', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Hãng xe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hãng</SelectItem>
            {carBrands.map((brand) => (
              <SelectItem key={brand.name} value={brand.name}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedPriceRange}
          onValueChange={(v) => {
            if (v === 'all') {
              updateFilters({ priceMin: '', priceMax: '' });
              return;
            }
            const range = priceRanges.find(r => r.label === v);
            if (range) updateFilters({ priceMin: range.min, priceMax: range.max });
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Mức giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giá</SelectItem>
            {priceRanges.map((range) => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.province || 'all'} onValueChange={(v) => handleFilterChange('province', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tỉnh/Thành" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toàn quốc</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-4 h-4" />
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
              <Select value={filters.yearMin || 'all'} onValueChange={(v) => handleFilterChange('yearMin', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Năm từ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.yearMax || 'all'} onValueChange={(v) => handleFilterChange('yearMax', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Năm đến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.fuel || 'all'} onValueChange={(v) => handleFilterChange('fuel', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nhiên liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Xăng">Xăng</SelectItem>
                  <SelectItem value="Dầu">Dầu</SelectItem>
                  <SelectItem value="Điện">Điện</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.transmission || 'all'} onValueChange={(v) => handleFilterChange('transmission', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Hộp số" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Số tự động">Số tự động</SelectItem>
                  <SelectItem value="Số sàn">Số sàn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
