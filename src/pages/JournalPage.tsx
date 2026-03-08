import { motion } from "framer-motion";
import { BookOpen, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { id: "kindness", label: "Kindness Moments", icon: Heart },
  { id: "spotlight", label: "Donor Spotlight", icon: Users },
  { id: "stories", label: "Community Stories", icon: BookOpen },
];

const mockStories = [
  {
    id: 1,
    section: "kindness",
    author: "@GratefulMama",
    title: "The School Supplies That Changed Everything",
    excerpt: "When my children needed school supplies and I couldn't afford them, a Bonitar showed up with everything on their list...",
    date: "Mar 5, 2026",
  },
  {
    id: 2,
    section: "spotlight",
    author: "@KindnessWarrior",
    title: "47 Items and Counting",
    excerpt: "I started giving away things I no longer needed, and it became my favorite thing to do...",
    date: "Mar 3, 2026",
  },
  {
    id: 3,
    section: "stories",
    author: "@CommunityBuilder",
    title: "How Our Neighborhood Became a Bonitar Hub",
    excerpt: "It started with one person donating a table. Then another donated clothes. Before we knew it, our entire community...",
    date: "Mar 1, 2026",
  },
  {
    id: 4,
    section: "kindness",
    author: "@QuietGiver",
    title: "A Blender, A Smoothie, A Smile",
    excerpt: "I gave away a blender I hadn't used in months. The recipient sent me a photo of the first smoothie they made...",
    date: "Feb 28, 2026",
  },
];

const JournalPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h1
              className="font-display text-4xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Dear Bonitar Journal
            </motion.h1>
            <p className="font-body text-muted-foreground max-w-md mx-auto">
              Stories of kindness, gratitude, and community — written by Bonitars
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            {sections.map((s) => (
              <button
                key={s.id}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mockStories.map((story, i) => (
              <motion.article
                key={story.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-body font-medium text-primary bg-coral-light px-2.5 py-0.5 rounded-full">
                    {sections.find(s => s.id === story.section)?.label}
                  </span>
                  <span className="text-xs font-body text-muted-foreground">{story.date}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{story.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">{story.excerpt}</p>
                <p className="font-body text-xs text-primary font-medium">By {story.author}</p>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="warmOutline">Share Your Story</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JournalPage;
