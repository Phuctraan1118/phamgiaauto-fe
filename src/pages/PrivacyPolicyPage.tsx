import { LockKeyhole, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content:
      'Khi người dùng liên hệ, đặt lịch xem xe, yêu cầu tư vấn hoặc gửi thông tin xe cần bán, website có thể ghi nhận họ tên, số điện thoại, email, nội dung yêu cầu và các thông tin xe do người dùng chủ động cung cấp.',
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    content:
      'Thông tin được sử dụng để tư vấn mua bán xe, xác nhận lịch hẹn, hỗ trợ định giá xe, phản hồi yêu cầu của khách hàng, cải thiện chất lượng dịch vụ và phục vụ các hoạt động chăm sóc khách hàng liên quan.',
  },
  {
    title: '3. Bảo mật và lưu trữ',
    content:
      'Phạm Gia Automotive áp dụng các biện pháp phù hợp để hạn chế truy cập trái phép, thất lạc hoặc sử dụng sai mục đích đối với thông tin khách hàng. Thông tin được lưu trữ trong thời gian cần thiết cho mục đích tư vấn, giao dịch và chăm sóc khách hàng.',
  },
  {
    title: '4. Chia sẻ thông tin',
    content:
      'Chúng tôi không bán thông tin cá nhân của khách hàng. Thông tin chỉ có thể được chia sẻ khi cần thiết cho việc tư vấn, thực hiện giao dịch, tuân thủ quy định pháp luật hoặc theo yêu cầu hợp lệ từ cơ quan có thẩm quyền.',
  },
  {
    title: '5. Cookie và dữ liệu kỹ thuật',
    content:
      'Website có thể sử dụng dữ liệu kỹ thuật cơ bản như trình duyệt, thiết bị, thời gian truy cập và hành vi tương tác để vận hành website ổn định, phân tích hiệu quả nội dung và cải thiện trải nghiệm người dùng.',
  },
  {
    title: '6. Quyền của khách hàng',
    content:
      'Khách hàng có thể liên hệ Phạm Gia Automotive để yêu cầu kiểm tra, điều chỉnh hoặc ngừng sử dụng thông tin liên hệ đã cung cấp, trong phạm vi phù hợp với quy trình vận hành và quy định pháp luật hiện hành.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <main className="bg-background pt-20">
        <section className="border-b bg-secondary/40 py-10 sm:py-14">
          <div className="container px-4">
            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-primary">Phạm Gia Automotive</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Chính sách bảo mật</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Chính sách này mô tả cách Phạm Gia Automotive thu thập, sử dụng và bảo vệ thông tin của khách hàng khi sử dụng website.
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
              <h2 className="mt-4 text-lg font-semibold">Liên hệ về dữ liệu cá nhân</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Nếu cần cập nhật hoặc yêu cầu hỗ trợ về thông tin đã cung cấp, vui lòng liên hệ đội ngũ Phạm Gia Automotive.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <a href="tel:+84794111112" className="flex items-center gap-2 font-semibold text-primary hover:underline">
                  <Phone className="h-4 w-4" />
                  +84 794 111 112
                </a>
                <a href="mailto:support@phamgiaauto.vn" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="h-4 w-4" />
                  support@phamgiaauto.vn
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
