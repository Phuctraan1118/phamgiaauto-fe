import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CompanyPageHeader } from '@/components/layout/CompanyPageHeader';
import { Button } from '@/components/ui/button';

const PHONE_DISPLAY = '+84 794 111 112';
const PHONE_TEL = '+84794111112';
const SHOWROOM_ADDRESS = '14 Đ. Số 07, KDC Đường 10, Bến Lức, Tây Ninh 82606, Việt Nam';
const SHOWROOM_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOWROOM_ADDRESS)}`;

const contactItems = [
  { icon: Phone, label: 'Hotline', value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
  { icon: Mail, label: 'Email', value: 'support@phamgiaauto.vn', href: 'mailto:support@phamgiaauto.vn' },
  { icon: MapPin, label: 'Showroom', value: SHOWROOM_ADDRESS, href: SHOWROOM_MAP_URL },
  { icon: Clock3, label: 'Thời gian làm việc', value: 'Thứ Hai - Chủ Nhật, 08:00 - 18:00' },
];

export default function ContactPage() {
  return (
    <Layout>
      <CompanyPageHeader
        eyebrow="Liên hệ"
        title="Trao đổi trực tiếp với Phạm Gia Auto"
        description="Liên hệ để đặt lịch xem xe, nhận tư vấn mua xe hoặc yêu cầu định giá chiếc xe bạn muốn bán."
      />
      <section className="py-10 sm:py-14">
        <div className="container grid gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold">Thông tin liên hệ</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Đội ngũ tư vấn sẽ tiếp nhận nhu cầu và sắp xếp lịch làm việc phù hợp.</p>
            <div className="mt-8 space-y-6">
              {contactItems.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('https://www.google.com/maps') ? '_blank' : undefined}
                        rel={item.href.startsWith('https://www.google.com/maps') ? 'noreferrer' : undefined}
                        className="mt-1 block text-sm text-muted-foreground hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-h-[300px] flex-col justify-center bg-secondary/50 p-6 sm:p-10">
            <p className="text-sm font-semibold text-primary">Đặt lịch trước khi đến</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Xem xe và lái thử tại showroom</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Gọi trước để đội ngũ chuẩn bị xe, hồ sơ liên quan và chuyên viên tư vấn đúng nhu cầu của bạn.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><a href={`tel:${PHONE_TEL}`}><Phone /> Gọi đặt lịch</a></Button>
              <Button asChild variant="outline" size="lg"><a href="mailto:support@phamgiaauto.vn"><Mail /> Gửi email</a></Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
