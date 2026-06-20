import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, Trash2, Car } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarCard } from '@/components/cars/CarCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type CarListingDB = Tables<'car_listings'>;

interface FavoriteWithCar {
  id: string;
  listing_id: string;
  listing_type: 'car';
  created_at: string;
  car: CarListingDB;
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [carFavorites, setCarFavorites] = useState<FavoriteWithCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch car favorites
      const { data: carFavs } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('listing_type', 'car')
        .order('created_at', { ascending: false });

      if (carFavs && carFavs.length > 0) {
        const carIds = carFavs.map(f => f.listing_id);
        const { data: cars } = await supabase
          .from('car_listings')
          .select('*')
          .in('id', carIds);

        const carsMap = new Map((cars || []).map(c => [c.id, c]));
        const carFavsWithData = carFavs
          .map(f => ({
            ...f,
            listing_type: 'car' as const,
            car: carsMap.get(f.listing_id)!
          }))
          .filter(f => f.car);
        
        setCarFavorites(carFavsWithData);
      } else {
        setCarFavorites([]);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      toast.error('Có lỗi xảy ra khi xóa');
      return;
    }

    setCarFavorites(prev => prev.filter(f => f.id !== favoriteId));
    toast.success('Đã xóa khỏi tin yêu thích');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem tin yêu thích</h1>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để lưu và xem các tin đăng yêu thích
          </p>
          <Link to="/auth">
            <Button size="lg">Đăng nhập</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const totalFavorites = carFavorites.length;

  return (
    <Layout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Tin yêu thích</h1>
              <p className="text-muted-foreground">
                {totalFavorites} tin đã lưu
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : totalFavorites === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Chưa có tin yêu thích</h2>
              <p className="text-muted-foreground mb-6">
                Lưu các tin đăng yêu thích để xem lại sau
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/xe">
                  <Button>
                    <Car className="w-4 h-4 mr-2" />
                    Xem xe
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="cars">
              <TabsList className="mb-6">
                <TabsTrigger value="cars" className="gap-2">
                  <Car className="w-4 h-4" />
                  Xe ({carFavorites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cars">
                {carFavorites.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Chưa có xe yêu thích</p>
                  </Card>
                ) : (
                  <div className="car-grid">
                    {carFavorites.map((fav, index) => (
                      <motion.div
                        key={fav.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <CarCard car={fav.car} index={index} />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFavorite(fav.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
