import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Car, Eye, EyeOff, Pencil, Trash2, Plus, 
  MoreVertical, TrendingUp, Clock, CheckCircle,
  Search, Loader2, Phone, Rocket, UsersRound
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase, type ApiManagedUser } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type CarListing = Tables<'car_listings'>;

const formatPrice = (price: number) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`;
  }
  return `${(price / 1000000).toFixed(0)} triệu`;
};

const formatMileage = (mileage: number | null) => {
  if (!mileage) return 'N/A';
  return `${mileage.toLocaleString('vi-VN')} km`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [carListings, setCarListings] = useState<CarListing[]>([]);
  const [ownerMap, setOwnerMap] = useState<Record<string, ApiManagedUser>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'car'; id: string } | null>(null);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContacts: 0,
    carViews: {} as Record<string, number>,
    carContacts: {} as Record<string, number>,
    plateViews: {} as Record<string, number>,
    plateContacts: {} as Record<string, number>,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/quan-ly-tin' } });
    }
  }, [user, authLoading, navigate]);

  // Fetch user's listings and stats
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        let carsQuery = supabase
          .from<CarListing>('car_listings')
          .select('*');

        if (user.role !== 'admin') {
          carsQuery = carsQuery.eq('user_id', user.id);
        }

        const carsResponse = await carsQuery.order('created_at', { ascending: false });

        if (carsResponse.error) throw carsResponse.error;

        const cars = (carsResponse.data || []) as CarListing[];
        const visibleListingIds = new Set(cars.map((car) => car.id));

        const [viewsResponse, contactsResponse, usersResponse] = await Promise.all([
          supabase
            .from('listing_views')
            .select('listing_id, listing_type'),
          supabase
            .from('listing_contacts')
            .select('listing_id, listing_type'),
          user.role === 'admin' ? supabase.admin.listUsers() : Promise.resolve({ data: null, error: null }),
        ]);

        if (usersResponse.error) throw usersResponse.error;

        setCarListings(cars);
        if (usersResponse.data) {
          const mappedOwners = usersResponse.data.reduce<Record<string, ApiManagedUser>>((acc, owner) => {
            acc[owner.id] = owner;
            return acc;
          }, {});
          setOwnerMap(mappedOwners);
        } else {
          setOwnerMap({});
        }

        // Calculate stats
        const carViews: Record<string, number> = {};
        const carContacts: Record<string, number> = {};
        let totalViews = 0;
        let totalContacts = 0;

        (viewsResponse.data || []).forEach(view => {
          if (view.listing_type === 'car' && visibleListingIds.has(view.listing_id)) {
            carViews[view.listing_id] = (carViews[view.listing_id] || 0) + 1;
            totalViews++;
          }
        });

        (contactsResponse.data || []).forEach(contact => {
          if (contact.listing_type === 'car' && visibleListingIds.has(contact.listing_id)) {
            carContacts[contact.listing_id] = (carContacts[contact.listing_id] || 0) + 1;
            totalContacts++;
          }
        });

        setStats({ totalViews, totalContacts, carViews, carContacts, plateViews: {}, plateContacts: {} });
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Không thể tải danh sách tin đăng');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Đang hiển thị</Badge>;
      case 'pending':
        return <Badge variant="upcoming"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'hidden':
        return <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Đã ẩn</Badge>;
      case 'sold':
        return <Badge variant="ended">Đã bán</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleToggleVisibility = async (type: 'car', id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hidden' ? 'active' : 'hidden';
    const table = 'car_listings';
    
    try {
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setCarListings(prev => prev.map(car => 
        car.id === id ? { ...car, status: newStatus } : car
      ));

      toast.success(newStatus === 'hidden' ? 'Đã ẩn tin đăng' : 'Đã hiển thị tin đăng');
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Không thể cập nhật trạng thái tin đăng');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    
    const table = 'car_listings';
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', deleteDialog.id);

      if (error) throw error;

      setCarListings(prev => prev.filter(car => car.id !== deleteDialog.id));
      
      toast.success('Đã xóa tin đăng thành công');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Không thể xóa tin đăng');
    } finally {
      setDeleteDialog(null);
    }
  };

  const [boostingId, setBoostingId] = useState<string | null>(null);

  const handleBoost = async (type: 'car', id: string) => {
    const table = 'car_listings';
    setBoostingId(id);
    
    try {
      const { error } = await supabase
        .from(table)
        .update({ boosted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setCarListings(prev => prev.map(car => 
        car.id === id ? { ...car, boosted_at: new Date().toISOString() } : car
      ));

      toast.success('Đã đẩy tin lên top thành công!');
    } catch (error) {
      console.error('Error boosting listing:', error);
      toast.error('Không thể đẩy tin. Vui lòng thử lại.');
    } finally {
      setBoostingId(null);
    }
  };

  const summaryStats = {
    totalCars: carListings.length,
    activeCars: carListings.filter(c => c.status === 'active').length,
  };

  const getOwnerLabel = (userId: string) => {
    const owner = ownerMap[userId];
    if (!owner) return 'Nhân sự nội bộ';
    return owner.full_name || owner.email;
  };

  const filteredCars = carListings.filter(car => 
    car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getOwnerLabel(car.user_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý tin đăng</h1>
            <p className="text-muted-foreground mt-1">
              {user.role === 'admin'
                ? 'Theo dõi toàn bộ tin xe của công ty và hiệu quả từng bài đăng'
                : 'Theo dõi tin xe bạn phụ trách và hiệu quả từng bài đăng'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/dang-tin">
              <Button variant="outline">
                <Car className="w-4 h-4" />
                Đăng tin xe
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summaryStats.totalCars}</p>
                  <p className="text-xs text-muted-foreground">Tin xe ({summaryStats.activeCars} đang hiển thị)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {user.role === 'admin' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <UsersRound className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(ownerMap).filter((id) => ownerMap[id].role === 'staff').length}</p>
                    <p className="text-xs text-muted-foreground">Nhân sự có thể đăng tin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Lượt xem</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalContacts}</p>
                  <p className="text-xs text-muted-foreground">Lượt liên hệ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tin đăng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cars" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cars" className="gap-2">
              <Car className="w-4 h-4" />
              Tin xe ({carListings.length})
            </TabsTrigger>
          </TabsList>

          {/* Car Listings Tab */}
          <TabsContent value="cars">
            {filteredCars.length > 0 ? (
              <div className="space-y-4">
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`overflow-hidden border-border/80 transition-shadow hover:shadow-md ${car.status === 'hidden' ? 'opacity-60' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="w-full md:w-52 h-36 md:h-auto flex-shrink-0">
                            <img 
                              src={car.images?.[0] || '/placeholder.svg'} 
                              alt={car.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {getStatusBadge(car.status)}
                                  {car.boosted_at && (
                                    <Badge variant="default" className="gradient-accent text-accent-foreground border-0">
                                      <Rocket className="w-3 h-3 mr-1" />
                                      Đang đẩy
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-foreground truncate">{car.title}</h3>
                                <p className="text-xl font-bold text-primary mt-1">{formatPrice(Number(car.price))}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                  <span>{car.year}</span>
                                  <span>•</span>
                                  <span>{formatMileage(car.mileage)}</span>
                                  <span>•</span>
                                  <span>{car.location || 'Chưa cập nhật'}</span>
                                </div>
                                {user.role === 'admin' && (
                                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                    <UsersRound className="h-3.5 w-3.5" />
                                    Người đăng: {getOwnerLabel(car.user_id)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Stats & Actions */}
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex flex-wrap justify-end gap-2 text-xs">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                                    <Eye className="w-3.5 h-3.5" />
                                    {stats.carViews[car.id] || 0} xem
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                                    <Phone className="w-3.5 h-3.5" />
                                    {stats.carContacts[car.id] || 0} liên hệ
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Đăng: {formatDate(car.created_at)}
                                </p>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/xe/${car.id}`} className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Xem tin
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link to={`/chinh-sua-xe/${car.id}`} className="flex items-center gap-2">
                                        <Pencil className="w-4 h-4" />
                                        Chỉnh sửa
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="flex items-center gap-2"
                                      onClick={() => handleBoost('car', car.id)}
                                      disabled={boostingId === car.id}
                                    >
                                      {boostingId === car.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <TrendingUp className="w-4 h-4" />
                                      )}
                                      Đẩy tin lên top
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="flex items-center gap-2"
                                      onClick={() => handleToggleVisibility('car', car.id, car.status)}
                                    >
                                      {car.status === 'hidden' ? (
                                        <><Eye className="w-4 h-4" />Hiển thị</>
                                      ) : (
                                        <><EyeOff className="w-4 h-4" />Ẩn tin</>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="flex items-center gap-2 text-destructive"
                                      onClick={() => setDeleteDialog({ open: true, type: 'car', id: car.id })}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Xóa tin
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Chưa có tin đăng xe nào</h3>
                <p className="text-muted-foreground mb-4">Bắt đầu đăng tin để bán xe của bạn</p>
                <Link to="/dang-tin">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Đăng tin bán xe
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tin đăng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa tin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
