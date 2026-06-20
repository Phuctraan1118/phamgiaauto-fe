import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Gauge, Images, MapPin, Settings2, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPrice, formatMileage } from '@/lib/mockData';
import { Tables } from '@/integrations/supabase/types';

type CarListingDB = Tables<'car_listings'>;

interface CarCardProps {
  car: CarListingDB;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const imageUrl = car.images && car.images.length > 0 ? car.images[0] : '/placeholder.svg';
  const imageCount = car.images?.length || 0;
  
  return (
    <motion.div
      className="w-full max-w-[300px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/xe/${car.id}`} aria-label={`Xem chi tiết ${car.title}`}>
        <Card className="group overflow-hidden border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            <img 
              src={imageUrl} 
              alt={car.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Xe tuyển chọn
              </span>
              {imageCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  <Images className="h-3.5 w-3.5" />
                  {imageCount}
                </span>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-3 pt-10 text-white">
              <p className="text-[10px] font-semibold uppercase text-white/75">
                {car.brand} · {car.model}
              </p>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5">
                {car.title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xl font-bold text-accent">
              {formatPrice(car.price)}
            </p>

            {/* Specifications */}
            <div className="mt-4 grid grid-cols-3 border-y border-border/70 py-3">
              <div className="flex min-w-0 flex-col items-center gap-1 border-r border-border/70 px-1 text-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] font-medium text-foreground">{car.year}</span>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-1 border-r border-border/70 px-1 text-center">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-full truncate text-[11px] font-medium text-foreground">
                  {car.mileage !== null ? formatMileage(car.mileage) : 'Chưa rõ'}
                </span>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-1 px-1 text-center">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-full truncate text-[11px] font-medium text-foreground">
                  {car.transmission || 'Chưa rõ'}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{car.location || 'Phạm Gia Auto'}</span>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
