import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Camera, Loader2, Save, ChevronLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/cai-dat' } });
    }
  }, [user, authLoading, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData({
            fullName: data.full_name || '',
            phone: data.phone || '',
            avatarUrl: data.avatar_url || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatarUrl }));
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Không thể tải lên ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName.trim() || null,
          phone: formData.phone.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Đã lưu thông tin tài khoản');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Cài đặt tài khoản</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
              <CardDescription>Ảnh này sẽ hiển thị trên các tin đăng của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.avatarUrl} alt="Avatar" />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      <User className="w-10 h-10 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Nhấn vào biểu tượng camera để thay đổi ảnh</p>
                  <p>Định dạng: JPG, PNG. Tối đa 2MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin hiển thị của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ví dụ: 0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    maxLength={15}
                  />
                  <p className="text-xs text-muted-foreground">Số điện thoại liên hệ khi khách hàng quan tâm đến tin đăng</p>
                </div>

                <Separator className="my-4" />

                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
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
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID tài khoản</span>
                <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span>{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
