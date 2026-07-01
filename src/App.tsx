import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/xe" element={<CarListPage />} />
            <Route path="/xe/:id" element={<CarDetailPage />} />
            <Route path="/thu-mua-xe" element={<CarBuyingPage />} />
            <Route path="/dich-vu" element={<ServicesPage />} />
            <Route path="/kiem-phat-nguoi" element={<TrafficViolationPage />} />
            <Route path="/ve-chung-toi" element={<AboutPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
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
