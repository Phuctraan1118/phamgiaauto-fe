import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  House,
  Car, 
  BadgeDollarSign,
  Wrench,
  Building2,
  FileSearch,
  Phone,
  PlusCircle, 
  User, 
  Menu, 
  X, 
  LogOut,
  Settings,
  FileText,
  Heart
} from 'lucide-react';
import logoPhamGia from '@/assets/logo-pham-gia.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const navigation = [
  { name: 'Trang chủ', href: '/', icon: House },
  { name: 'Kho xe', href: '/xe', icon: Car },
  { name: 'Thu mua xe', href: '/thu-mua-xe', icon: BadgeDollarSign },
  { name: 'Kiểm phạt nguội', href: '/kiem-phat-nguoi', icon: FileSearch },
  { name: 'Dịch vụ', href: '/dich-vu', icon: Wrench },
  { name: 'Về chúng tôi', href: '/ve-chung-toi', icon: Building2 },
  { name: 'Liên hệ', href: '/lien-he', icon: Phone },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handlePostClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/dang-tin');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Đã đăng xuất thành công');
    navigate('/');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-card/95 backdrop-blur-md shadow-md" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src={logoPhamGia}
              alt="Phạm Gia Automotive"
              className="h-10 w-auto object-contain sm:h-12 md:h-14"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navigation.map((item) => {
              const isActive = item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        Tài khoản
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/quan-ly-tin" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Quản lý tin đăng
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/yeu-thich" className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Tin yêu thích
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/cai-dat" className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Cài đặt tài khoản
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </>
            )}
            {isAdmin && (
              <Button variant="hero" size="sm" className="gap-2" onClick={handlePostClick}>
                <PlusCircle className="w-4 h-4" />
                Đăng tin xe
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-card border-t border-border overflow-hidden shadow-lg"
          >
            <div className="container py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border space-y-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/quan-ly-tin" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <FileText className="w-4 h-4" />
                          Quản lý tin đăng
                        </Button>
                      </Link>
                    )}
                    <Link to="/yeu-thich" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Heart className="w-4 h-4" />
                        Tin yêu thích
                      </Button>
                    </Link>
                    <Link to="/cai-dat" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Settings className="w-4 h-4" />
                        Cài đặt tài khoản
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      Đăng nhập / Đăng ký
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Button variant="hero" className="w-full justify-start gap-2" onClick={handlePostClick}>
                    <PlusCircle className="w-4 h-4" />
                    Đăng tin xe
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
