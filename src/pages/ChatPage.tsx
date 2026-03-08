import { Send, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const mockConversations = [
  { id: 1, name: "@HopefulSoul", lastMsg: "Thanks for the books!", time: "2h ago", unread: 2 },
  { id: 2, name: "@KindnessWarrior", lastMsg: "When can I pick up?", time: "5h ago", unread: 0 },
  { id: 3, name: "@GratefulHeart", lastMsg: "You're amazing! 🙏", time: "1d ago", unread: 0 },
];

const mockMessages = [
  { id: 1, sender: "them", text: "Hi! Is the children's book bundle still available?", time: "2:30 PM" },
  { id: 2, sender: "me", text: "Yes it is! Would you like to arrange pickup?", time: "2:32 PM" },
  { id: 3, sender: "them", text: "That would be wonderful! I'm near the Central Market area.", time: "2:35 PM" },
  { id: 4, sender: "me", text: "Great! How about we meet at the bus stop near Central Market tomorrow at 3 PM?", time: "2:37 PM" },
  { id: 5, sender: "them", text: "Thanks for the books! My kids will love them 📚", time: "3:15 PM" },
];

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 h-screen flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10 font-body text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 text-left border-b border-border hover:bg-accent transition-colors ${
                  selectedChat === conv.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-sm font-semibold text-foreground">{conv.name}</span>
                  <span className="font-body text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground truncate">{conv.lastMsg}</span>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-body">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border bg-card">
            <h3 className="font-body text-sm font-semibold text-foreground">@HopefulSoul</h3>
            <p className="font-body text-xs text-muted-foreground">About: Children's Books Bundle</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-accent text-foreground rounded-bl-sm"
                }`}>
                  <p className="font-body text-sm">{msg.text}</p>
                  <p className={`font-body text-[10px] mt-1 ${
                    msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-card">
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                placeholder="Type a message..."
                className="flex-1 font-body"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button variant="hero" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
