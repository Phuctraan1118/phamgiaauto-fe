import { Link } from 'react-router-dom';
import { BadgeDollarSign, CarFront, FileCheck2, SearchCheck, ShieldCheck, Wrench } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CompanyPageHeader } from '@/components/layout/CompanyPageHeader';
import { Button } from '@/components/ui/button';

const services = [
  { icon: SearchCheck, title: 'Kiểm tra xe', description: 'Đánh giá tổng thể động cơ, khung gầm, thân vỏ, nội thất và trang bị.' },
  { icon: FileCheck2, title: 'Hỗ trợ sang tên', description: 'Tư vấn hồ sơ chuyển nhượng và các bước cần thiết để nhận xe.' },
  { icon: BadgeDollarSign, title: 'Định giá xe cũ', description: 'Tham chiếu tình trạng thực tế và mặt bằng thị trường tại thời điểm kiểm tra.' },
  { icon: ShieldCheck, title: 'Tư vấn lịch sử xe', description: 'Cung cấp thông tin đang có để khách hàng hiểu rõ chiếc xe trước khi quyết định.' },
  { icon: Wrench, title: 'Hỗ trợ sau bán', description: 'Tiếp nhận và hướng dẫn xử lý các vấn đề phát sinh trong quá trình sử dụng.' },
  { icon: CarFront, title: 'Tìm xe theo nhu cầu', description: 'Tư vấn dòng xe, ngân sách và mục đích sử dụng phù hợp với từng khách hàng.' },
];

export default function ServicesPage() {
  return (
    <Layout>
      <CompanyPageHeader
        eyebrow="Dịch vụ Phạm Gia Auto"
        title="Hỗ trợ trọn hành trình mua bán xe"
        description="Từ kiểm tra, định giá đến thủ tục và hậu mãi, đội ngũ của chúng tôi đồng hành ở từng bước quan trọng."
      />
      <section className="py-10 sm:py-14">
        <div className="container px-4">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="border-b border-border pb-7">
                <service.icon className="mb-4 h-7 w-7 text-primary" />
                <h2 className="text-lg font-semibold">{service.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-secondary/40 py-10">
        <div className="container flex flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bạn cần tư vấn dịch vụ?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Trao đổi trực tiếp với đội ngũ Phạm Gia Auto.</p>
          </div>
          <Button asChild size="lg"><Link to="/lien-he">Liên hệ tư vấn</Link></Button>
        </div>
      </section>
    </Layout>
  );
}
