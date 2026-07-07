import { FileText, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    title: '1. Phạm vi sử dụng',
    content:
      'Website phamgiaautomotive.vn cung cấp thông tin về kho xe, dịch vụ thu mua xe, tư vấn giao dịch và các tiện ích hỗ trợ kiểm tra hồ sơ xe. Khi sử dụng website, người dùng đồng ý tuân thủ các điều khoản được công bố tại trang này.',
  },
  {
    title: '2. Thông tin xe và giao dịch',
    content:
      'Thông tin xe, giá bán, hình ảnh, tình trạng và mô tả được Phạm Gia Automotive cập nhật theo dữ liệu tại thời điểm đăng tải. Người mua nên liên hệ trực tiếp để xác nhận tình trạng xe, hồ sơ pháp lý, lịch xem xe và các chi phí liên quan trước khi giao dịch.',
  },
  {
    title: '3. Trách nhiệm của người dùng',
    content:
      'Người dùng cần cung cấp thông tin liên hệ chính xác khi đặt lịch, gửi yêu cầu tư vấn hoặc yêu cầu định giá xe. Không sử dụng website để gửi nội dung sai lệch, gây rối, xâm phạm quyền lợi của bên thứ ba hoặc thực hiện hành vi trái pháp luật.',
  },
  {
    title: '4. Dịch vụ kiểm tra phạt nguội',
    content:
      'Tính năng kiểm phạt nguội chỉ có mục đích hỗ trợ tham khảo thông tin. Kết quả có thể phụ thuộc nguồn dữ liệu bên thứ ba và thời điểm cập nhật. Người dùng nên xác minh lại với cơ quan có thẩm quyền khi cần quyết định pháp lý hoặc giao dịch quan trọng.',
  },
  {
    title: '5. Giới hạn trách nhiệm',
    content:
      'Phạm Gia Automotive nỗ lực duy trì thông tin chính xác và trải nghiệm ổn định, nhưng không cam kết website luôn không gián đoạn hoặc không có sai sót kỹ thuật. Mọi giao dịch thực tế cần được xác nhận bằng hồ sơ, hợp đồng và thỏa thuận trực tiếp giữa các bên.',
  },
  {
    title: '6. Thay đổi điều khoản',
    content:
      'Phạm Gia Automotive có thể cập nhật điều khoản sử dụng khi cần thiết để phù hợp với hoạt động kinh doanh, quy định pháp luật hoặc thay đổi kỹ thuật của website. Phiên bản mới có hiệu lực kể từ khi được công bố trên website.',
  },
];

export default function TermsPage() {
  return (
    <Layout>
      <main className="bg-background pt-20">
        <section className="border-b bg-secondary/40 py-10 sm:py-14">
          <div className="container px-4">
            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-primary">Phạm Gia Automotive</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Điều khoản sử dụng</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Các điều khoản áp dụng khi truy cập, tham khảo thông tin và sử dụng tiện ích trên website Phạm Gia Automotive.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">Cập nhật lần cuối: 07/07/2026</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="container grid gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {sections.map((section) => (
                <Card key={section.title}>
                  <CardContent className="p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <aside className="h-fit rounded-xl border bg-card p-5">
              <ShieldCheck className="h-7 w-7 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">Cần hỗ trợ?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Liên hệ Phạm Gia Automotive để được tư vấn trực tiếp về xe, lịch xem xe hoặc thủ tục giao dịch.
              </p>
              <a href="tel:+84794111112" className="mt-4 block text-sm font-semibold text-primary hover:underline">
                +84 794 111 112
              </a>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
