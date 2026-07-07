import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePageSeo } from "@/hooks/usePageSeo";
import HomePage from "./pages/HomePage";
import CarListPage from "./pages/CarListPage";
import CarDetailPage from "./pages/CarDetailPage";
import CreateListingPage from "./pages/CreateListingPage";
import EditCarListingPage from "./pages/EditCarListingPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import MyListingsPage from "./pages/MyListingsPage";
import UserManagementPage from "./pages/UserManagementPage";
import FavoritesPage from "./pages/FavoritesPage";
import AuthPage from "./pages/AuthPage";
import CarBuyingPage from "./pages/CarBuyingPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TrafficViolationPage from "./pages/TrafficViolationPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const SITE_URL = "https://phamgiaautomotive.vn";

const routeSeo = [
  {
    match: (path: string) => path === "/",
    title: "Phạm Gia Automotive - Chuyên mua bán xe ô tô cũ tuyển chọn",
    description: "Phạm Gia Automotive chuyên mua bán xe ô tô cũ tuyển chọn, xe được kiểm tra kỹ, hồ sơ rõ ràng và tư vấn minh bạch.",
  },
  {
    match: (path: string) => path === "/xe" || path.startsWith("/xe/"),
    title: "Kho xe cũ tuyển chọn - Phạm Gia Automotive",
    description: "Xem kho xe ô tô cũ tuyển chọn tại Phạm Gia Automotive, thông tin xe rõ ràng, giá minh bạch và hỗ trợ đặt lịch xem xe.",
  },
  {
    match: (path: string) => path === "/thu-mua-xe",
    title: "Thu mua xe ô tô cũ nhanh gọn - Phạm Gia Automotive",
    description: "Dịch vụ thu mua xe ô tô cũ chính chủ, kiểm tra xe, định giá minh bạch và hỗ trợ thủ tục chuyển nhượng.",
  },
  {
    match: (path: string) => path === "/dich-vu",
    title: "Dịch vụ mua bán xe cũ - Phạm Gia Automotive",
    description: "Dịch vụ tư vấn mua bán xe cũ, kiểm tra hồ sơ, hỗ trợ sang tên và đặt lịch xem xe tại Phạm Gia Automotive.",
  },
  {
    match: (path: string) => path === "/kiem-phat-nguoi",
    title: "Kiểm phạt nguội ô tô - Phạm Gia Automotive",
    description: "Tra cứu phạt nguội ô tô, kiểm tra trạng thái xử lý vi phạm và hỗ trợ minh bạch hồ sơ xe trước khi giao dịch.",
  },
  {
    match: (path: string) => path === "/ve-chung-toi",
    title: "Về Phạm Gia Automotive - Showroom xe cũ uy tín",
    description: "Phạm Gia Automotive là đơn vị mua bán xe ô tô cũ tuyển chọn, hướng đến giao dịch rõ ràng, chuyên nghiệp và lâu dài.",
  },
  {
    match: (path: string) => path === "/lien-he",
    title: "Liên hệ Phạm Gia Automotive - Đặt lịch xem xe",
    description: "Liên hệ Phạm Gia Automotive để đặt lịch xem xe, nhận tư vấn mua xe cũ hoặc yêu cầu định giá xe cần bán.",
  },
  {
    match: (path: string) => path === "/dieu-khoan-su-dung",
    title: "Điều khoản sử dụng - Phạm Gia Automotive",
    description: "Điều khoản sử dụng website Phạm Gia Automotive khi xem thông tin xe cũ, đặt lịch xem xe, yêu cầu tư vấn và sử dụng tiện ích hỗ trợ.",
  },
  {
    match: (path: string) => path === "/chinh-sach-bao-mat",
    title: "Chính sách bảo mật - Phạm Gia Automotive",
    description: "Chính sách bảo mật thông tin khách hàng khi liên hệ, đặt lịch xem xe, yêu cầu tư vấn hoặc sử dụng website Phạm Gia Automotive.",
  },
];

const privatePathPrefixes = [
  "/auth",
  "/cai-dat",
  "/quan-ly-tin",
  "/quan-ly-nhan-su",
  "/yeu-thich",
  "/dang-tin",
  "/chinh-sua-xe",
];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function RouteSeo() {
  const { pathname } = useLocation();
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const seo = routeSeo.find((item) => item.match(normalizedPath)) || routeSeo[0];
  const isPrivate = privatePathPrefixes.some((prefix) => normalizedPath.startsWith(prefix));

  usePageSeo({
    title: seo.title,
    description: seo.description,
    canonical: `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}`,
    robots: isPrivate ? "noindex, nofollow" : "index, follow",
  });

  return null;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

function StaffRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!["admin", "staff"].includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RouteSeo />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/xe" element={<CarListPage />} />
            <Route path="/xe/:id" element={<CarDetailPage />} />
            <Route path="/thu-mua-xe" element={<CarBuyingPage />} />
            <Route path="/dich-vu" element={<ServicesPage />} />
            <Route path="/kiem-phat-nguoi" element={<TrafficViolationPage />} />
            <Route path="/ve-chung-toi" element={<AboutPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/dieu-khoan-su-dung" element={<TermsPage />} />
            <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
            <Route path="/bien-so" element={<NotFound />} />
            <Route path="/bien-so/:id" element={<NotFound />} />
            <Route path="/dang-tin" element={<StaffRoute><CreateListingPage /></StaffRoute>} />
            <Route path="/dang-tin-bien-so" element={<NotFound />} />
            <Route path="/chinh-sua-xe/:id" element={<StaffRoute><EditCarListingPage /></StaffRoute>} />
            <Route path="/chinh-sua-bien-so/:id" element={<NotFound />} />
            <Route path="/cai-dat" element={<AccountSettingsPage />} />
            <Route path="/quan-ly-tin" element={<StaffRoute><MyListingsPage /></StaffRoute>} />
            <Route path="/quan-ly-nhan-su" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
            <Route path="/yeu-thich" element={<FavoritesPage />} />
            <Route path="/dau-gia-bien-so" element={<NotFound />} />
            <Route path="/dau-gia-bien-so/:id" element={<NotFound />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
