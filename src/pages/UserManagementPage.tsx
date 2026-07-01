import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Phone, Plus, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type ApiManagedUser } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff' as 'staff' | 'admin',
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN');

export default function UserManagementPage() {
  const [users, setUsers] = useState<ApiManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const staffCount = useMemo(() => users.filter((user) => user.role === 'staff').length, [users]);
  const adminCount = useMemo(() => users.filter((user) => user.role === 'admin').length, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.admin.listUsers();
    if (error) {
      toast.error('Không thể tải danh sách nhân sự');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.admin.createUser({
      email,
      password,
      full_name: form.fullName.trim(),
      phone: form.phone.trim(),
      role: form.role,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message || 'Không thể tạo tài khoản');
      return;
    }

    if (data) setUsers((current) => [data, ...current]);
    setForm(initialForm);
    toast.success('Đã tạo tài khoản nội bộ');
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Badge>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Quản lý nhân sự</h1>
            <p className="mt-1 text-muted-foreground">
              Cấp tài khoản nội bộ cho nhân sự đăng và quản lý xe của công ty
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-72">
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{staffCount}</p>
                <p className="text-xs text-muted-foreground">Staff đăng tin</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-xs text-muted-foreground">Admin quản trị</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-primary" />
                Tạo tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ tên</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Nhân sự bán hàng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="staff@phamgiaautomotive.vn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="090..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Tối thiểu 8 ký tự"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) => setForm((current) => ({ ...current, role: value as 'staff' | 'admin' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff đăng tin</SelectItem>
                      <SelectItem value="admin">Admin quản trị</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UsersRound className="h-5 w-5 text-primary" />
                Danh sách nội bộ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                          <UserRound className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{user.full_name || 'Chưa cập nhật tên'}</p>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Admin' : 'Staff'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground sm:text-right">
                        Tạo ngày {formatDate(user.created_at)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-10 text-center">
                  <UsersRound className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">Chưa có tài khoản nội bộ</p>
                  <p className="mt-1 text-sm text-muted-foreground">Tạo tài khoản staff đầu tiên để bắt đầu phân quyền đăng tin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
