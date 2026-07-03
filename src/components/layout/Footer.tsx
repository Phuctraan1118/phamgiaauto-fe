import { Link } from 'react-router-dom';
import { Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import logoPhamGia from '@/assets/logo-pham-gia.png';

const PHONE_DISPLAY = '+84 794 111 112';
const PHONE_TEL = '+84794111112';
const SHOWROOM_ADDRESS = '14 Đ. Số 07, KDC Đường 10, Bến Lức, Tây Ninh 82606, Việt Nam';
const SHOWROOM_MAP_URL = 'https://www.google.com/maps/place/CTY+CP+TRUY%E1%BB%80N+TH%C3%94NG+PH%E1%BA%A0M+GIA+MEDIA/@10.6406618,106.4934446,20.52z/data=!4m15!1m8!3m7!1s0x310acc892dac172b:0x10082b90b9e835b7!2zMTQsIMSQxrDhu51uZyBT4buRIDE0LzE1IMSQLiBT4buRIDEwLCBLREMsIELhur9uIEzhu6ljLCBUw6J5IE5pbmgsIFZp4buHdCBOYW0!3b1!8m2!3d10.6403445!4d106.4933865!16s%2Fg%2F11xsqrtsws!3m5!1s0x310acd6946d88d81:0x8d5306d9374a7d36!8m2!3d10.640574!4d106.4934389!16s%2Fg%2F11z58b57y6?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D';

export function Footer() {
  return (
    <footer className="gradient-primary text-primary-foreground">
      <div className="container px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src={logoPhamGia}
                alt="Phạm Gia Automotive"
                className="h-20 w-auto object-contain sm:h-24 md:h-28"
              />
            </Link>
            <p className="text-xs sm:text-sm text-primary-foreground/75">
              Website chính thức của Phạm Gia Auto, chuyên mua bán xe cũ tuyển chọn.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-lg">Liên kết nhanh</h3>
            <nav className="space-y-1.5 sm:space-y-2">
              <Link to="/xe" className="block text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                Mua xe cũ
              </Link>
              <Link to="/xe" className="block text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                Kho xe hiện có
              </Link>
              <Link to="/thu-mua-xe" className="block text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                Thu mua xe cũ
              </Link>
              <Link to="/ve-chung-toi" className="block text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                Về chúng tôi
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-lg">Hỗ trợ</h3>
            <nav className="space-y-1.5 sm:space-y-2">
              <Link to="/dich-vu" className="block text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">Dịch vụ</Link>
              <Link to="/lien-he" className="block text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">Liên hệ tư vấn</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-lg">Liên hệ</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Hotline</p>
                  <a href={`tel:${PHONE_TEL}`} className="text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Email</p>
                  <p className="text-xs sm:text-sm text-primary-foreground/75 break-all">support@phamgiaauto.vn</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Địa chỉ</p>
                  <a
                    href={SHOWROOM_MAP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors"
                  >
                    {SHOWROOM_ADDRESS}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-primary-foreground/70 text-center sm:text-left">
            ©2026 Phạm Gia Automotive. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-xs sm:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
