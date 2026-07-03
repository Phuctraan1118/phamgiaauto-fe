import { Link } from 'react-router-dom';
import { BadgeCheck, Banknote, Car, ClipboardCheck, Phone, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CompanyPageHeader } from '@/components/layout/CompanyPageHeader';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: Phone, title: 'Tiếp nhận thông tin', description: 'Gửi hãng xe, đời xe, số km và tình trạng hiện tại cho đội ngũ tư vấn.' },
  { icon: ClipboardCheck, title: 'Kiểm tra và định giá', description: 'Chuyên viên kiểm tra thực tế, đối chiếu lịch sử và báo giá minh bạch.' },
  { icon: Banknote, title: 'Thanh toán nhanh', description: 'Thống nhất giá, hoàn tất hồ sơ và thanh toán theo phương thức phù hợp.' },
];

export default function CarBuyingPage() {
  return (
    <Layout>
      <CompanyPageHeader
        eyebrow="Thu mua xe đã qua sử dụng"
        title="Bán xe nhanh, định giá rõ ràng"
        description="Phạm Gia Auto thu mua xe chính chủ, hỗ trợ kiểm tra tận nơi và hoàn tất thủ tục chuyển nhượng gọn gàng."
      />

      <section className="py-10 sm:py-14">
        <div className="container px-4">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Quy trình thu mua</h2>
            <p className="mt-2 text-muted-foreground">Ba bước rõ ràng để bạn chủ động về thời gian và giá bán.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="border-t-2 border-primary pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <step.icon className="h-7 w-7 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-10 sm:py-14">
        <div className="container grid gap-8 px-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold">Chúng tôi ưu tiên xe có hồ sơ rõ ràng</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[['Xe chính chủ', BadgeCheck], ['Hỗ trợ thủ tục', RefreshCw], ['Định giá theo thị trường', Banknote], ['Kiểm tra chuyên nghiệp', Car]].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center gap-3 text-sm font-medium">
                  <Icon className="h-5 w-5 text-primary" />
                  {label as string}
                </div>
              ))}
            </div>
          </div>
          <a href="tel:+84794111112">
            <Button size="lg" className="w-full sm:w-auto"><Phone /> Gọi định giá xe</Button>
          </a>
        </div>
      </section>

      <section className="py-8 text-center">
        <p className="text-sm text-muted-foreground">Bạn đang tìm xe thay thế?</p>
        <Link to="/xe" className="mt-2 inline-block font-semibold text-primary hover:underline">Xem kho xe hiện có</Link>
      </section>
    </Layout>
  );
}
