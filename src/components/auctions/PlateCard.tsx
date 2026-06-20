import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/mockData';
import { Tables } from '@/integrations/supabase/types';

type PlateListingDB = Tables<'plate_listings'>;

interface PlateCardProps {
  plate: PlateListingDB;
  index?: number;
}

export function PlateCard({ plate, index = 0 }: PlateCardProps) {
  const getStatusBadge = () => {
    switch (plate.status) {
      case 'active':
        return <Badge variant="success">Đang bán</Badge>;
      case 'pending':
        return <Badge variant="upcoming">Chờ duyệt</Badge>;
      case 'sold':
        return <Badge variant="ended">Đã bán</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/bien-so/${plate.id}`}>
        <Card className="overflow-hidden card-hover group p-3 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            {getStatusBadge()}
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {plate.plate_type}
            </Badge>
          </div>

          {/* Plate Number */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="plate-number text-sm sm:text-xl md:text-2xl px-3 sm:px-6 py-2 sm:py-3">
              {plate.plate_number}
            </div>
          </div>

          {/* Province */}
          {plate.province && (
            <p className="text-center text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              {plate.province}
            </p>
          )}

          {/* Price */}
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Giá bán</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">
              {formatPrice(plate.price)}
            </p>
            {plate.starting_price && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Giá đấu giá gốc: {formatPrice(plate.starting_price)}
              </p>
            )}
          </div>

          {/* CTA */}
          {plate.status === 'active' && (
            <Button variant="accent" className="w-full group-hover:shadow-lg text-xs sm:text-sm h-8 sm:h-10">
              Xem chi tiết
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}

          {plate.status === 'sold' && (
            <div className="text-center py-1 sm:py-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Đã bán</p>
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
