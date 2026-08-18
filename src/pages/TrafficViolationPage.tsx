import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock3,
  FileSearch,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000').replace(/\/$/, '');
const API_PREFIX = API_URL.endsWith('/api') ? '' : '/api';

type VehicleType = 'car' | 'motorbike' | 'electric_bike';

type Violation = {
  vehicleColor?: string;
  violationTime?: string;
  violationLocation?: string;
  violationBehavior?: string;
  handlingUnit?: string;
  resolutionAddress?: string;
  status?: string;
};

type ViolationResponse = {
  licensePlate: string;
  vehicleType: VehicleType;
  violationData?: {
    violations?: Violation[];
    totalViolations?: number;
    handledCount?: number;
    unhandledCount?: number;
    updatedAt?: string;
  };
  cache?: {
    isStale?: boolean;
    source?: string;
  };
};

const vehicleLabels: Record<VehicleType, string> = {
  car: 'Ô tô',
  motorbike: 'Xe máy',
  electric_bike: 'Xe máy điện',
};

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'Chưa có thời gian cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function TrafficViolationPage() {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [bypassCache, setBypassCache] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ViolationResponse | null>(null);
  const resultPanelRef = useRef<HTMLDivElement>(null);

  const violations = result?.violationData?.violations ?? [];
  const summary = useMemo(() => {
    const total = result?.violationData?.totalViolations ?? violations.length;
    const handled = result?.violationData?.handledCount ?? 0;
    const unhandled = result?.violationData?.unhandledCount ?? Math.max(total - handled, 0);
    return { total, handled, unhandled };
  }, [result, violations.length]);

  useEffect(() => {
    if (!result && !error) return;
    resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [error, result]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPlate = normalizePlate(licensePlate);
    if (!normalizedPlate) {
      setError('Vui lòng nhập biển số cần kiểm tra');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}${API_PREFIX}/traffic-violations/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: normalizedPlate,
          vehicleType,
          bypassCache,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || 'Không kiểm tra được phạt nguội lúc này');
      }
      setLicensePlate(normalizedPlate);
      setResult(payload as ViolationResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không kiểm tra được phạt nguội lúc này');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-card via-background to-secondary/70 pt-20">
        <section className="container py-8 lg:py-10">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge variant="accent" className="mb-3 gap-2 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Tra cứu nhanh cho xe trước khi giao dịch
              </Badge>
              <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Kiểm phạt nguội xe ô tô
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Kiểm tra vi phạm, trạng thái xử lý và nơi giải quyết ngay trên một màn hình để tư vấn mua bán xe minh bạch hơn.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-lg border bg-card/80 px-4 py-3">
                <p className="font-semibold text-foreground">Nguồn tra cứu</p>
                <p className="mt-1 text-xs">Cổng dữ liệu phạt nguội</p>
              </div>
              <div className="rounded-lg border bg-card/80 px-4 py-3">
                <p className="font-semibold text-foreground">Phạm vi</p>
                <p className="mt-1 text-xs">Ô tô, xe máy, xe điện</p>
              </div>
              <div className="rounded-lg border bg-card/80 px-4 py-3">
                <p className="font-semibold text-foreground">Mục đích</p>
                <p className="mt-1 text-xs">Hỗ trợ kiểm tra hồ sơ xe</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
            <div className="grid lg:grid-cols-[390px_minmax(0,1fr)]">
              <aside className="border-b bg-card p-5 lg:border-b-0 lg:border-r lg:p-6">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-muted-foreground">Thông tin tra cứu</p>
                  <h2 className="mt-1 text-2xl font-bold">Nhập biển số</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">Biển số xe</Label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="licensePlate"
                          value={licensePlate}
                          onChange={(event) => setLicensePlate(event.target.value.toUpperCase())}
                          placeholder="VD: 62P0828"
                          className="h-12 pl-10 text-base font-semibold uppercase tracking-wide"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        <Label>Loại phương tiện</Label>
                        <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as VehicleType)}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Ô tô</SelectItem>
                            <SelectItem value="motorbike">Xe máy</SelectItem>
                            <SelectItem value="electric_bike">Xe máy điện</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <label className="flex h-12 items-center gap-2 self-end rounded-md border px-3 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={bypassCache}
                          onChange={(event) => setBypassCache(event.target.checked)}
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        Làm mới
                      </label>
                    </div>

                    <Button type="submit" className="h-12 w-full gap-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                      Kiểm tra phạt nguội
                    </Button>
                  </form>

                  <div className="mt-5 rounded-lg bg-secondary/70 p-4">
                    <p className="text-sm font-semibold">Gợi ý nhập biển số</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Có thể nhập liền không dấu gạch, ví dụ <span className="font-semibold text-foreground">62P0828</span>.
                    </p>
                  </div>
              </aside>

              <div ref={resultPanelRef} className="min-h-[430px] p-5 lg:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Kết quả tra cứu</p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {result ? result.licensePlate : 'Chưa có biển số được kiểm tra'}
                    </h2>
                  </div>
                  {result && (
                    <Badge variant={summary.unhandled > 0 ? 'destructive' : 'success'} className="w-fit gap-2 px-3 py-1">
                      {summary.unhandled > 0 ? <Siren className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {summary.unhandled > 0 ? 'Có vi phạm cần xử lý' : 'Chưa ghi nhận vi phạm'}
                    </Badge>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Không thể kiểm tra</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!result && !error && (
                  <div className="flex min-h-[310px] flex-col items-center justify-center rounded-xl border border-dashed bg-secondary/40 p-8 text-center">
                    <FileSearch className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Sẵn sàng kiểm tra biển số</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Sau khi tra cứu, tóm tắt và chi tiết vi phạm sẽ xuất hiện ngay tại khu vực này.
                    </p>
                  </div>
                )}

                {result && (
                  <div className="space-y-5">
                    {violations.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5">
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="destructive" className="gap-2">
                                <Siren className="h-3.5 w-3.5" />
                                {violations[0].status || 'Cần kiểm tra'}
                              </Badge>
                              <span className="text-sm font-medium text-muted-foreground">
                                {violations[0].violationTime || 'Đang cập nhật thời gian'}
                              </span>
                            </div>
                            <p className="mt-3 text-base font-semibold leading-7">
                              {violations[0].violationBehavior || 'Đang cập nhật hành vi vi phạm'}
                            </p>
                            <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                              <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                              <span>{violations[0].violationLocation || 'Đang cập nhật vị trí ghi nhận'}</span>
                            </div>
                          </div>
                          <div className="rounded-lg bg-background px-4 py-3 text-sm shadow-sm sm:min-w-[150px]">
                            <p className="text-muted-foreground">Chưa xử lý</p>
                            <p className="mt-1 text-2xl font-bold text-destructive">{summary.unhandled}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ['Biển số', result.licensePlate, vehicleLabels[result.vehicleType] ?? 'Phương tiện', 'text-foreground'],
                        ['Tổng vi phạm', String(summary.total), 'Theo dữ liệu trả về', 'text-foreground'],
                        ['Chưa xử lý', String(summary.unhandled), 'Cần kiểm tra hồ sơ', 'text-destructive'],
                        ['Đã xử lý', String(summary.handled), 'Đã có trạng thái hoàn tất', 'text-success'],
                      ].map(([label, value, helper, valueClass]) => (
                        <div key={label} className="rounded-lg border bg-background p-4">
                          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                          <p className={cn('mt-2 text-2xl font-bold tracking-wide', valueClass)}>{value}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        Cập nhật: {formatUpdatedAt(result.violationData?.updatedAt)}
                      </div>
                      <Badge variant={result.cache?.isStale ? 'warning' : 'success'} className="w-fit gap-2">
                        <RefreshCw className="h-3.5 w-3.5" />
                        {result.cache?.source === 'cache' ? 'Dữ liệu cache' : 'Dữ liệu mới'}
                      </Badge>
                    </div>

                    {violations.length === 0 ? (
                      <div className="rounded-xl border border-success/30 bg-success/5 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                        <h3 className="mt-4 text-2xl font-semibold">Chưa ghi nhận vi phạm</h3>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                          Biển số này hiện không có dữ liệu phạt nguội trong kết quả trả về.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">Chi tiết vi phạm</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Kiểm tra kỹ trạng thái trước khi tư vấn, mua bán hoặc sang tên xe.
                          </p>
                        </div>

                        {violations.map((violation, index) => {
                          const isUnhandled = (violation.status || '').toLowerCase().includes('chưa');
                          return (
                            <div key={`${violation.violationTime}-${index}`} className="overflow-hidden rounded-xl border bg-background">
                              <div className="grid gap-0 xl:grid-cols-[220px_minmax(0,1fr)]">
                                <div className={cn('p-5 text-primary-foreground', isUnhandled ? 'bg-destructive' : 'bg-success')}>
                                  <Siren className="h-6 w-6" />
                                  <p className="mt-4 text-sm opacity-85">Trạng thái</p>
                                  <p className="mt-1 text-xl font-bold">{violation.status || 'Chưa rõ'}</p>
                                  <p className="mt-4 text-sm opacity-85">Thời gian</p>
                                  <p className="mt-1 font-semibold">{violation.violationTime || 'Đang cập nhật'}</p>
                                </div>
                                <div className="space-y-5 p-5">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Hành vi vi phạm</p>
                                    <p className="mt-1 text-base font-semibold leading-7">
                                      {violation.violationBehavior || 'Đang cập nhật'}
                                    </p>
                                  </div>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg bg-secondary/60 p-4">
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <MapPin className="h-4 w-4" />
                                        Vị trí ghi nhận
                                      </div>
                                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {violation.violationLocation || 'Đang cập nhật'}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/60 p-4">
                                      <p className="text-sm font-medium">Đặc điểm xe</p>
                                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {violation.vehicleColor || 'Đang cập nhật'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Đơn vị xử lý</p>
                                      <p className="mt-1 text-sm leading-6">{violation.handlingUnit || 'Đang cập nhật'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Nơi giải quyết</p>
                                      <p className="mt-1 whitespace-pre-line text-sm leading-6">
                                        {violation.resolutionAddress || 'Đang cập nhật'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
