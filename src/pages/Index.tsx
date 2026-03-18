import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import WhisperBanner from "@/components/home/WhisperBanner";
import NearbyFeed from "@/components/home/NearbyFeed";
import HowItWorks from "@/components/home/HowItWorks";
import SpotlightPreview from "@/components/home/SpotlightPreview";
import SupportSection from "@/components/home/SupportSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WhisperBanner />
      <NearbyFeed />
      <HowItWorks />
      <SpotlightPreview />
      <SupportSection />
      <Footer />
    </div>
  );
};

export default Index;
