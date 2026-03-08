import { Camera, MapPin, Tag, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  "Food", "Electronics", "Gadgets", "Books", "Clothing", "Shoes",
  "Furniture", "Appliances", "Baby items", "School supplies", "Kitchen items", "Other"
];

const PostItemPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Post a Donation</h1>
          <p className="font-body text-muted-foreground mb-8">Share something you no longer need with your community</p>

          <form className="space-y-6 bg-card rounded-2xl p-8 shadow-card border border-border" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <Tag className="inline h-4 w-4 mr-1" /> Item Title
              </label>
              <Input placeholder="What are you donating?" className="font-body" />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <FileText className="inline h-4 w-4 mr-1" /> Description
              </label>
              <textarea
                placeholder="Describe the condition, size, and any other details..."
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm font-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="px-3 py-2 rounded-lg text-xs font-body text-muted-foreground border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <Camera className="inline h-4 w-4 mr-1" /> Photos (min. 3)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-border bg-accent flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground font-body">Photo {i}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <MapPin className="inline h-4 w-4 mr-1" /> Pickup Location (public places only)
              </label>
              <Input placeholder="e.g. Church of Grace, Bus Stop near Market..." className="font-body" />
              <p className="text-xs text-muted-foreground font-body mt-1">
                Churches, schools, bus stops, shopping plazas, or markets only
              </p>
            </div>

            <div className="bg-accent rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <p className="text-xs font-body text-muted-foreground">
                Prohibited items: sand, rags, trash, dangerous materials, or broken unusable items. 
                Violations may result in account restriction.
              </p>
            </div>

            <Button variant="hero" size="lg" className="w-full">
              Post Donation
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostItemPage;
