import { Eye, Handshake, ShieldCheck, Target } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CompanyPageHeader } from '@/components/layout/CompanyPageHeader';

const values = [
  { icon: ShieldCheck, title: 'Minh bạch', description: 'Thông tin xe và quy trình giao dịch được trao đổi rõ ràng.' },
  { icon: Eye, title: 'Tuyển chọn', description: 'Ưu tiên những chiếc xe có nguồn gốc và tình trạng phù hợp.' },
  { icon: Handshake, title: 'Đồng hành', description: 'Tư vấn dựa trên nhu cầu sử dụng và ngân sách thực tế.' },
];

export default function AboutPage() {
  return (
    <Layout>
      <CompanyPageHeader
        eyebrow="Về chúng tôi"
        title="Phạm Gia Auto"
        description="Đơn vị mua bán xe đã qua sử dụng hướng đến trải nghiệm giao dịch rõ ràng, chuyên nghiệp và lâu dài."
      />
      <section className="py-10 sm:py-14">
        <div className="container grid gap-10 px-4 lg:grid-cols-2 lg:items-start">
          <div>
            <Target className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Một nơi đáng tin để chọn xe cũ</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
            <p>Phạm Gia Auto xây dựng kho xe dành cho khách hàng muốn tìm một chiếc xe đã qua sử dụng nhưng vẫn cần tiêu chuẩn kiểm tra và thông tin rõ ràng.</p>
            <p>Chúng tôi trực tiếp quản lý tin đăng, tư vấn từng chiếc xe và hỗ trợ khách hàng xuyên suốt từ lúc tìm hiểu đến khi hoàn tất giao dịch.</p>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-secondary/40 py-10 sm:py-14">
        <div className="container px-4">
          <h2 className="mb-8 text-2xl font-bold">Giá trị chúng tôi theo đuổi</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title}>
                <value.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
