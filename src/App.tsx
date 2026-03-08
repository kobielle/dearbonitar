import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ItemFeedPage from "./pages/ItemFeedPage";
import PostItemPage from "./pages/PostItemPage";
import ChatPage from "./pages/ChatPage";
import JournalPage from "./pages/JournalPage";
import DonorProfilePage from "./pages/DonorProfilePage";
import DonorSpotlightPage from "./pages/DonorSpotlightPage";
import AdvertisePage from "./pages/AdvertisePage";
import SupportPage from "./pages/SupportPage";
import GuidelinesPage from "./pages/GuidelinesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/feed" element={<ItemFeedPage />} />
          <Route path="/post-item" element={<PostItemPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/profile" element={<DonorProfilePage />} />
          <Route path="/spotlight" element={<DonorSpotlightPage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
