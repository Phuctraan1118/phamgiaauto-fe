import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Car, FileText, ImagePlus, Eye, Send, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { carBrands, carFeatureOptions, carProductionYears, provinces, formatPrice, formatMileage } from '@/lib/mockData';
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
  { id: 5, title: 'Đăng tin', icon: Send },
];

const fuelTypes = ['Xăng', 'Dầu', 'Điện', 'Hybrid'];
const transmissionTypes = ['Số sàn', 'Số tự động'];
const originTypes = ['Trong nước', 'Nhập khẩu'];
const colorOptions = ['Trắng', 'Đen', 'Bạc', 'Xám', 'Đỏ', 'Xanh dương', 'Xanh rêu', 'Vàng', 'Cam', 'Nâu'];
const seatsOptions = [2, 4, 5, 7, 8, 9, 16];

interface FormData {
  // Step 1: Car info
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
  
  // Step 2: Price & documents
  price: string;
  title: string;
  description: string;
  locationProvince: string;
  hasRegistration: boolean;
  hasInspection: boolean;
  hasInsurance: boolean;
  
  // Step 3: Images
  images: string[];
}

const initialFormData: FormData = {
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
  hasRegistration: false,
  hasInspection: false,
  hasInsurance: false,
  images: [],
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [customFeature, setCustomFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { images, uploading, handleFileSelect, removeImage: removeUploadedImage, setImages } = useImageUpload(user?.id, {
    folder: 'cars',
  });

  // Sync images to formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, images }));
  }, [images]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Vui lòng đăng nhập để đăng tin');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const selectedBrand = carBrands.find(b => b.name === formData.brand);
  const availableModels = selectedBrand?.models || [];
  const visibleFeatureOptions = Array.from(new Set([...carFeatureOptions, ...formData.features]));

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
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

  const addCustomFeature = () => {
    const normalizedFeature = customFeature.trim().replace(/\s+/g, ' ');
    if (!normalizedFeature) return;

    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(normalizedFeature)
        ? prev.features
        : [...prev.features, normalizedFeature],
    }));
    setCustomFeature('');
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
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng tin');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('car_listings').insert({
        user_id: user.id,
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
        status: 'active',
      });

      if (error) {
        console.error('Error creating listing:', error);
        toast.error('Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.');
        return;
      }

      toast.success('Đăng tin thành công!');
      navigate('/quan-ly-tin');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

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
          <Label htmlFor="brand">Hãng xe *</Label>
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
          <Label htmlFor="model">Dòng xe *</Label>
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
          <Label htmlFor="year">Năm sản xuất *</Label>
          <Select value={formData.year} onValueChange={(v) => updateFormData('year', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {carProductionYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage">Số km đã đi *</Label>
          <Input
            type="number"
            placeholder="Ví dụ: 50000"
            value={formData.mileage}
            onChange={(e) => updateFormData('mileage', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel">Nhiên liệu *</Label>
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
          <Label htmlFor="transmission">Hộp số *</Label>
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
          <Label htmlFor="color">Màu sắc *</Label>
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
          <Label htmlFor="origin">Xuất xứ</Label>
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
          <Label htmlFor="seats">Số chỗ ngồi *</Label>
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={customFeature}
            onChange={(event) => setCustomFeature(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustomFeature();
              }
            }}
            placeholder="Nhập tiện ích khác, ví dụ: Camera hành trình Vietmap"
          />
          <Button type="button" variant="outline" onClick={addCustomFeature} className="shrink-0">
            Thêm tiện ích
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleFeatureOptions.map(feature => (
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
        <Label htmlFor="title">Tiêu đề tin đăng *</Label>
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
          <Label htmlFor="price">Giá bán (VNĐ) *</Label>
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
          <Label htmlFor="locationProvince">Tỉnh/Thành phố *</Label>
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
        <Label htmlFor="description">Mô tả chi tiết *</Label>
        <Textarea
          placeholder="Mô tả tình trạng xe, lịch sử bảo dưỡng, lý do bán..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={5}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">{formData.description.length}/2000 ký tự</p>
      </div>

      <div className="space-y-4">
        <Label>Giấy tờ xe</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`cursor-pointer transition-all ${formData.hasRegistration ? 'ring-2 ring-primary' : ''}`}
                onClick={() => updateFormData('hasRegistration', !formData.hasRegistration)}>
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox checked={formData.hasRegistration} />
              <div>
                <p className="font-medium">Đăng ký xe</p>
                <p className="text-xs text-muted-foreground">Đã có giấy đăng ký</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${formData.hasInspection ? 'ring-2 ring-primary' : ''}`}
                onClick={() => updateFormData('hasInspection', !formData.hasInspection)}>
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox checked={formData.hasInspection} />
              <div>
                <p className="font-medium">Đăng kiểm</p>
                <p className="text-xs text-muted-foreground">Còn hạn đăng kiểm</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${formData.hasInsurance ? 'ring-2 ring-primary' : ''}`}
                onClick={() => updateFormData('hasInsurance', !formData.hasInsurance)}>
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox checked={formData.hasInsurance} />
              <div>
                <p className="font-medium">Bảo hiểm</p>
                <p className="text-xs text-muted-foreground">Còn hạn bảo hiểm</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Thêm hình ảnh xe</h3>
        <p className="text-muted-foreground">Có thể tải nhiều ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {formData.images.map((img, index) => (
          <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted group">
            <img src={img} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
            {index === 0 && (
              <Badge className="absolute top-2 left-2" variant="secondary">Ảnh chính</Badge>
            )}
            <button
              onClick={() => removeUploadedImage(index)}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <ImageDropZone onFiles={handleFileSelect} uploading={uploading} />
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Lưu ý khi chụp ảnh:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Chụp ảnh trong điều kiện ánh sáng tốt</li>
          <li>• Nên có ảnh: ngoại thất 4 góc, nội thất, đồng hồ taplo, động cơ</li>
          <li>• Ảnh rõ nét, không bị mờ hoặc rung</li>
          <li>• Kích thước tối đa 5MB mỗi ảnh</li>
        </ul>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Xem trước tin đăng</h3>
        <p className="text-muted-foreground">Kiểm tra lại thông tin trước khi đăng</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image gallery preview */}
            <div className="p-4">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-2">
                <img 
                  src={formData.images[0] || '/placeholder.svg'} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.images.slice(1, 5).map((img, index) => (
                  <div key={index} className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                    <img src={img} alt={`Thumb ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {formData.images.length > 5 && (
                  <div className="w-16 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground">+{formData.images.length - 5}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info preview */}
            <div className="p-4 space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">Chờ duyệt</Badge>
                <h2 className="text-xl font-bold">{formData.title || 'Tiêu đề tin đăng'}</h2>
                <p className="text-2xl font-bold text-primary mt-2">
                  {formData.price ? formatPrice(parseInt(formData.price)) : '---'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hãng xe:</span>
                  <span className="font-medium">{formData.brand || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dòng xe:</span>
                  <span className="font-medium">{formData.model || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Năm SX:</span>
                  <span className="font-medium">{formData.year || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số km:</span>
                  <span className="font-medium">{formData.mileage ? formatMileage(parseInt(formData.mileage)) : '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nhiên liệu:</span>
                  <span className="font-medium">{formData.fuel || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hộp số:</span>
                  <span className="font-medium">{formData.transmission || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Màu sắc:</span>
                  <span className="font-medium">{formData.color || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số chỗ:</span>
                  <span className="font-medium">{formData.seats ? `${formData.seats} chỗ` : '---'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Vị trí:</span>
                <span className="font-medium">{formData.locationProvince || '---'}</span>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.features.slice(0, 5).map(f => (
                    <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                  ))}
                  {formData.features.length > 5 && (
                    <Badge variant="outline" className="text-xs">+{formData.features.length - 5}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t p-4">
            <h4 className="font-semibold mb-2">Mô tả</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {formData.description || 'Chưa có mô tả'}
            </p>
          </div>

          {/* Documents */}
          <div className="border-t p-4">
            <h4 className="font-semibold mb-2">Giấy tờ</h4>
            <div className="flex gap-3">
              {formData.hasRegistration && <Badge variant="secondary">Đăng ký xe</Badge>}
              {formData.hasInspection && <Badge variant="secondary">Đăng kiểm</Badge>}
              {formData.hasInsurance && <Badge variant="secondary">Bảo hiểm</Badge>}
              {!formData.hasRegistration && !formData.hasInspection && !formData.hasInsurance && (
                <span className="text-sm text-muted-foreground">Chưa cung cấp thông tin</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep5 = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Send className="w-10 h-10 text-primary" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-2">Sẵn sàng đăng tin!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tin đăng của bạn sẽ được kiểm duyệt trong vòng 24 giờ. 
          Sau khi duyệt, tin sẽ xuất hiện trên trang danh sách xe.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto text-left">
        <h4 className="font-semibold mb-3">Tóm tắt tin đăng:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">Xe:</span>
            <span className="font-medium">{formData.brand} {formData.model} {formData.year}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Giá:</span>
            <span className="font-medium text-primary">{formData.price ? formatPrice(parseInt(formData.price)) : '---'}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Số ảnh:</span>
            <span className="font-medium">{formData.images.length} ảnh</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Vị trí:</span>
            <span className="font-medium">{formData.locationProvince}</span>
          </li>
        </ul>
      </div>

      <Button 
        size="lg" 
        className="min-w-[200px]" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Đang đăng...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Đăng tin ngay
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Đăng tin bán xe</h1>
          
          {renderStepIndicator()}

          <Card>
            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              {currentStep < 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button onClick={nextStep}>
                    Tiếp tục
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 5 && (
                <div className="flex justify-center mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={prevStep}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại chỉnh sửa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
