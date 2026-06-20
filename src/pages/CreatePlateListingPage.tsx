import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, CreditCard, FileText, ImagePlus, Eye, Send, X, Upload, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PlateDisplay } from '@/components/auctions/PlateDisplay';
import { provinces, formatPrice } from '@/lib/mockData';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';

const steps = [
  { id: 1, title: 'Thông tin biển số', icon: CreditCard },
  { id: 2, title: 'Giá & giấy tờ', icon: FileText },
  { id: 3, title: 'Hình ảnh', icon: ImagePlus },
  { id: 4, title: 'Xem trước', icon: Eye },
  { id: 5, title: 'Đăng tin', icon: Send },
];

const vehicleTypes = ['Ô tô', 'Xe máy'];

interface FormData {
  // Step 1: Plate info
  plateNumber: string;
  province: string;
  vehicleType: string;
  originalAuctionDate: string;
  originalAuctionPrice: string;
  
  // Step 2: Price & documents
  price: string;
  description: string;
  hasRegistration: boolean;
  hasTransferPaper: boolean;
  
  // Step 3: Images
  images: string[];
}

const initialFormData: FormData = {
  plateNumber: '',
  province: '',
  vehicleType: '',
  originalAuctionDate: '',
  originalAuctionPrice: '',
  price: '',
  description: '',
  hasRegistration: false,
  hasTransferPaper: false,
  images: [],
};

export default function CreatePlateListingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { images, uploading, handleFileSelect, removeImage: removeUploadedImage } = useImageUpload(user?.id, {
    maxFiles: 5,
    folder: 'plates',
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

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (e.target) e.target.value = '';
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.plateNumber || !formData.province || !formData.vehicleType) {
          toast.error('Vui lòng điền đầy đủ thông tin biển số');
          return false;
        }
        return true;
      case 2:
        if (!formData.price || !formData.description) {
          toast.error('Vui lòng điền đầy đủ thông tin giá và mô tả');
          return false;
        }
        return true;
      case 3:
        if (formData.images.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 ảnh giấy tờ');
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
      const { error } = await supabase.from('plate_listings').insert({
        user_id: user.id,
        plate_number: formData.plateNumber.trim(),
        plate_type: formData.vehicleType,
        province: formData.province || null,
        price: parseInt(formData.price),
        starting_price: formData.originalAuctionPrice ? parseInt(formData.originalAuctionPrice) : null,
        description: formData.description.trim() || null,
        images: formData.images.length > 0 ? formData.images : null,
        status: 'active',
      });

      if (error) {
        console.error('Error creating plate listing:', error);
        toast.error('Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.');
        return;
      }

      toast.success('Đăng tin thành công!');
      navigate('/quan-ly-tin');
    } catch (error) {
      console.error('Error creating plate listing:', error);
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
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Thông tin biển số</h3>
        <p className="text-muted-foreground text-sm">Nhập thông tin biển số bạn muốn bán</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plateNumber">Số biển *</Label>
        <Input
          placeholder="Ví dụ: 30A-888.88"
          value={formData.plateNumber}
          onChange={(e) => updateFormData('plateNumber', e.target.value.toUpperCase())}
          className="text-center text-xl font-bold tracking-wider"
        />
        {formData.plateNumber && (
          <div className="flex justify-center mt-4">
            <PlateDisplay plateNumber={formData.plateNumber} size="lg" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="province">Tỉnh/Thành phố *</Label>
          <Select value={formData.province} onValueChange={(v) => updateFormData('province', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn tỉnh/thành" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(province => (
                <SelectItem key={province} value={province}>{province}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleType">Loại xe *</Label>
          <Select value={formData.vehicleType} onValueChange={(v) => updateFormData('vehicleType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại xe" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-secondary/50">
        <h4 className="font-medium mb-4">Thông tin đấu giá gốc (nếu có)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="originalAuctionDate">Ngày trúng đấu giá</Label>
            <Input
              type="date"
              value={formData.originalAuctionDate}
              onChange={(e) => updateFormData('originalAuctionDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalAuctionPrice">Giá trúng đấu giá (VNĐ)</Label>
            <Input
              type="number"
              placeholder="Ví dụ: 500000000"
              value={formData.originalAuctionPrice}
              onChange={(e) => updateFormData('originalAuctionPrice', e.target.value)}
            />
            {formData.originalAuctionPrice && (
              <p className="text-sm text-primary font-medium">
                {formatPrice(parseInt(formData.originalAuctionPrice))}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="price">Giá bán (VNĐ) *</Label>
        <Input
          type="number"
          placeholder="Ví dụ: 850000000"
          value={formData.price}
          onChange={(e) => updateFormData('price', e.target.value)}
        />
        {formData.price && (
          <p className="text-xl text-primary font-bold">
            {formatPrice(parseInt(formData.price))}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả chi tiết *</Label>
        <Textarea
          placeholder="Mô tả về biển số, lý do bán, hỗ trợ sang tên..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={5}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">{formData.description.length}/1000 ký tự</p>
      </div>

      <div className="space-y-4">
        <Label>Giấy tờ pháp lý</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`cursor-pointer transition-all ${formData.hasRegistration ? 'ring-2 ring-primary' : ''}`}
                onClick={() => updateFormData('hasRegistration', !formData.hasRegistration)}>
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox checked={formData.hasRegistration} />
              <div>
                <p className="font-medium">Giấy đăng ký xe</p>
                <p className="text-xs text-muted-foreground">Có giấy đăng ký kèm biển số</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${formData.hasTransferPaper ? 'ring-2 ring-primary' : ''}`}
                onClick={() => updateFormData('hasTransferPaper', !formData.hasTransferPaper)}>
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox checked={formData.hasTransferPaper} />
              <div>
                <p className="font-medium">Giấy sang tên</p>
                <p className="text-xs text-muted-foreground">Có giấy tờ hỗ trợ sang tên</p>
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
        <h3 className="text-lg font-semibold mb-2">Thêm hình ảnh giấy tờ</h3>
        <p className="text-muted-foreground">Tối đa 5 ảnh. Chụp rõ giấy tờ chứng minh quyền sở hữu.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {formData.images.map((img, index) => (
          <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted group">
            <img src={img} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeUploadedImage(index)}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {formData.images.length < 5 && (
          <button
            onClick={handleImageUploadClick}
            disabled={uploading}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Lưu ý khi chụp ảnh giấy tờ:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Chụp rõ giấy chứng nhận trúng đấu giá (nếu có)</li>
          <li>• Chụp giấy đăng ký xe gắn với biển số</li>
          <li>• Ảnh rõ nét, không bị mờ, che khuất</li>
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
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-4">Chờ duyệt</Badge>
            <PlateDisplay plateNumber={formData.plateNumber || 'XX-XXXX'} size="xl" className="mb-4" />
            <p className="text-muted-foreground">{formData.province} • {formData.vehicleType}</p>
          </div>

          <div className="text-center mb-6 pb-6 border-b">
            <p className="text-sm text-muted-foreground">Giá bán</p>
            <p className="text-3xl font-bold text-primary">
              {formData.price ? formatPrice(parseInt(formData.price)) : '---'}
            </p>
            {formData.originalAuctionPrice && (
              <p className="text-sm text-muted-foreground mt-1">
                Giá đấu giá gốc: {formatPrice(parseInt(formData.originalAuctionPrice))}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Mô tả</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {formData.description || 'Chưa có mô tả'}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Giấy tờ</h4>
              <div className="flex gap-2 flex-wrap">
                {formData.hasRegistration && <Badge variant="secondary">Giấy đăng ký xe</Badge>}
                {formData.hasTransferPaper && <Badge variant="secondary">Giấy sang tên</Badge>}
                {!formData.hasRegistration && !formData.hasTransferPaper && (
                  <span className="text-sm text-muted-foreground">Chưa cung cấp</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Hình ảnh ({formData.images.length})</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="w-20 h-16 rounded overflow-hidden flex-shrink-0">
                    <img src={img} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
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
          Sau khi duyệt, tin sẽ xuất hiện trên trang biển số đấu giá.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto text-left">
        <h4 className="font-semibold mb-3">Tóm tắt tin đăng:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">Biển số:</span>
            <span className="font-bold">{formData.plateNumber}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Tỉnh/Thành:</span>
            <span className="font-medium">{formData.province}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Giá bán:</span>
            <span className="font-medium text-primary">{formData.price ? formatPrice(parseInt(formData.price)) : '---'}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Số ảnh:</span>
            <span className="font-medium">{formData.images.length} ảnh</span>
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Đăng tin bán biển số</h1>
          
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
