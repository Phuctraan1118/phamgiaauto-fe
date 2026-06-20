import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Car, FileText, ImagePlus, Eye, Save, X, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { carBrands, provinces, formatPrice } from '@/lib/mockData';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageDropZone } from '@/components/listings/ImageDropZone';

const steps = [
  { id: 1, title: 'Thông tin xe', icon: Car },
  { id: 2, title: 'Giá & giấy tờ', icon: FileText },
  { id: 3, title: 'Hình ảnh', icon: ImagePlus },
  { id: 4, title: 'Xem trước', icon: Eye },
];

const fuelTypes = ['Xăng', 'Dầu', 'Điện', 'Hybrid'];
const transmissionTypes = ['Số sàn', 'Số tự động'];
const originTypes = ['Trong nước', 'Nhập khẩu'];
const colorOptions = ['Trắng', 'Đen', 'Bạc', 'Xám', 'Đỏ', 'Xanh dương', 'Xanh rêu', 'Vàng', 'Cam', 'Nâu'];
const seatsOptions = [2, 4, 5, 7, 8, 9, 16];
const featureOptions = [
  'Cửa sổ trời', 'Ghế da', 'Camera 360', 'Camera lùi', 'Cảm biến va chạm', 
  'Đèn LED', 'Màn hình cảm ứng', 'Apple CarPlay', 'Android Auto', 'Định vị GPS',
  'Ghế chỉnh điện', 'Ghế thông gió', 'Ghế sưởi', 'Cảm biến áp suất lốp', 
  'Cruise Control', 'Phanh ABS', 'Cân bằng điện tử', 'Khởi động nút bấm'
];

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  fuel: string;
  transmission: string;
  color: string;
  origin: string;
  seats: string;
  features: string[];
  price: string;
  title: string;
  description: string;
  locationProvince: string;
  images: string[];
}

export default function EditCarListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuel: '',
    transmission: '',
    color: '',
    origin: '',
    seats: '',
    features: [],
    price: '',
    title: '',
    description: '',
    locationProvince: '',
    images: [],
  });

  const { images, uploading, handleFileSelect, removeImage: removeUploadedImage, setImages } = useImageUpload(user?.id, {
    maxFiles: 10,
    folder: 'cars',
  });

  // Fetch listing data
  useEffect(() => {
    async function fetchListing() {
      if (!id || !user) return;

      const { data, error } = await supabase
        .from('car_listings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Không tìm thấy tin đăng hoặc bạn không có quyền chỉnh sửa');
        navigate('/quan-ly-tin');
        return;
      }

      setFormData({
        brand: data.brand || '',
        model: data.model || '',
        year: data.year?.toString() || '',
        mileage: data.mileage?.toString() || '',
        fuel: data.fuel_type || '',
        transmission: data.transmission || '',
        color: data.color || '',
        origin: data.origin || '',
        seats: data.seats?.toString() || '',
        features: data.features || [],
        price: data.price?.toString() || '',
        title: data.title || '',
        description: data.description || '',
        locationProvince: data.location || '',
        images: data.images || [],
      });
      
      setImages(data.images || []);
      setIsLoading(false);
    }

    if (!authLoading && user) {
      fetchListing();
    }
  }, [id, user, authLoading, navigate, setImages]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Vui lòng đăng nhập');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Sync images to formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, images }));
  }, [images]);

  const selectedBrand = carBrands.find(b => b.name === formData.brand);
  const availableModels = selectedBrand?.models || [];

  const updateFormData = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.brand || !formData.model || !formData.year || !formData.mileage || 
            !formData.fuel || !formData.transmission || !formData.color || !formData.seats) {
          toast.error('Vui lòng điền đầy đủ thông tin xe');
          return false;
        }
        return true;
      case 2:
        if (!formData.price || !formData.title || !formData.description || !formData.locationProvince) {
          toast.error('Vui lòng điền đầy đủ thông tin giá và mô tả');
          return false;
        }
        return true;
      case 3:
        if (formData.images.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 ảnh');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user || !id) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('car_listings')
        .update({
          title: formData.title.trim(),
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseInt(formData.price),
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          fuel_type: formData.fuel || null,
          transmission: formData.transmission || null,
          color: formData.color || null,
          origin: formData.origin || null,
          seats: formData.seats ? parseInt(formData.seats) : null,
          features: formData.features.length > 0 ? formData.features : null,
          description: formData.description.trim() || null,
          location: formData.locationProvince || null,
          images: formData.images.length > 0 ? formData.images : null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating listing:', error);
        toast.error('Có lỗi xảy ra khi cập nhật tin. Vui lòng thử lại.');
        return;
      }

      toast.success('Cập nhật tin thành công!');
      navigate('/quan-ly-tin');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium hidden sm:block ${
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 md:w-16 lg:w-24 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Hãng xe *</Label>
          <Select value={formData.brand} onValueChange={(v) => { updateFormData('brand', v); updateFormData('model', ''); }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn hãng xe" />
            </SelectTrigger>
            <SelectContent>
              {carBrands.map(brand => (
                <SelectItem key={brand.name} value={brand.name}>{brand.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Dòng xe *</Label>
          <Select value={formData.model} onValueChange={(v) => updateFormData('model', v)} disabled={!formData.brand}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn dòng xe" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Năm sản xuất *</Label>
          <Select value={formData.year} onValueChange={(v) => updateFormData('year', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 15 }, (_, i) => 2024 - i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Số km đã đi *</Label>
          <Input
            type="number"
            placeholder="Ví dụ: 50000"
            value={formData.mileage}
            onChange={(e) => updateFormData('mileage', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Nhiên liệu *</Label>
          <Select value={formData.fuel} onValueChange={(v) => updateFormData('fuel', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại nhiên liệu" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map(fuel => (
                <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Hộp số *</Label>
          <Select value={formData.transmission} onValueChange={(v) => updateFormData('transmission', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại hộp số" />
            </SelectTrigger>
            <SelectContent>
              {transmissionTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Màu sắc *</Label>
          <Select value={formData.color} onValueChange={(v) => updateFormData('color', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn màu xe" />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map(color => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Xuất xứ</Label>
          <Select value={formData.origin} onValueChange={(v) => updateFormData('origin', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn xuất xứ" />
            </SelectTrigger>
            <SelectContent>
              {originTypes.map(origin => (
                <SelectItem key={origin} value={origin}>{origin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Số chỗ ngồi *</Label>
          <Select value={formData.seats} onValueChange={(v) => updateFormData('seats', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn số chỗ" />
            </SelectTrigger>
            <SelectContent>
              {seatsOptions.map(seats => (
                <SelectItem key={seats} value={seats.toString()}>{seats} chỗ</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Tính năng & tiện ích</Label>
        <div className="flex flex-wrap gap-2">
          {featureOptions.map(feature => (
            <Badge
              key={feature}
              variant={formData.features.includes(feature) ? 'default' : 'outline'}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleFeature(feature)}
            >
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tiêu đề tin đăng *</Label>
        <Input
          placeholder="Ví dụ: Toyota Camry 2.5Q 2022 - Xe đẹp như mới"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">{formData.title.length}/100 ký tự</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Giá bán (VNĐ) *</Label>
          <Input
            type="number"
            placeholder="Ví dụ: 850000000"
            value={formData.price}
            onChange={(e) => updateFormData('price', e.target.value)}
          />
          {formData.price && (
            <p className="text-sm text-primary font-medium">
              {formatPrice(parseInt(formData.price))}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Tỉnh/Thành phố *</Label>
          <Select value={formData.locationProvince} onValueChange={(v) => updateFormData('locationProvince', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(province => (
                <SelectItem key={province} value={province}>{province}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Mô tả chi tiết *</Label>
        <Textarea
          placeholder="Mô tả tình trạng xe, lịch sử bảo dưỡng, lý do bán..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={5}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">{formData.description.length}/2000 ký tự</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Hình ảnh xe ({formData.images.length}/10)</Label>
        <p className="text-sm text-muted-foreground">Thêm tối đa 10 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {formData.images.map((img, index) => (
          <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
            <img src={img} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeUploadedImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {index === 0 && (
              <Badge className="absolute top-2 left-2">Ảnh chính</Badge>
            )}
          </div>
        ))}

        {formData.images.length < 10 && (
          <ImageDropZone onFiles={handleFileSelect} uploading={uploading} />
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Xem trước tin đăng</h3>
      
      <Card>
        <CardContent className="p-6">
          {formData.images.length > 0 && (
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <img src={formData.images[0]} alt="Ảnh chính" className="w-full h-full object-cover" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
          <p className="text-3xl font-bold text-primary mb-4">
            {formData.price ? formatPrice(parseInt(formData.price)) : 'Chưa có giá'}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Năm SX</p>
              <p className="font-semibold">{formData.year}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Số km</p>
              <p className="font-semibold">{formData.mileage ? parseInt(formData.mileage).toLocaleString() : '-'}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Hộp số</p>
              <p className="font-semibold">{formData.transmission}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Nhiên liệu</p>
              <p className="font-semibold">{formData.fuel}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Thông tin xe</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Hãng xe:</span> {formData.brand}</p>
                <p><span className="text-muted-foreground">Dòng xe:</span> {formData.model}</p>
                <p><span className="text-muted-foreground">Màu sắc:</span> {formData.color}</p>
                <p><span className="text-muted-foreground">Số chỗ:</span> {formData.seats}</p>
                <p><span className="text-muted-foreground">Xuất xứ:</span> {formData.origin || 'Không rõ'}</p>
                <p><span className="text-muted-foreground">Vị trí:</span> {formData.locationProvince}</p>
              </div>
            </div>

            {formData.features.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tính năng</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map(f => (
                    <Badge key={f} variant="secondary">{f}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Mô tả</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/quan-ly-tin')} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại quản lý tin
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Chỉnh sửa tin đăng xe</h1>
        </div>

        {renderStepIndicator()}

        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              Tiếp theo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
