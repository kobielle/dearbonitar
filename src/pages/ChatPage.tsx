import { Send, Search, ArrowLeft, MessageSquare, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useConversations, useMessages, sendMessage } from "@/lib/bonitarCloud";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SCAM_PHRASES = [
  "send money", "transfer money", "delivery fee", "bank transfer",
  "whatsapp", "telegram", "pay first", "western union", "moneygram",
  "bitcoin", "crypto", "gift card", "cash app", "zelle",
];

const containsScamPhrase = (text: string): string | null => {
  const lower = text.toLowerCase();
  return SCAM_PHRASES.find((phrase) => lower.includes(phrase)) || null;
};

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { conversations, loading: convsLoading } = useConversations();
  const { messages, loading: msgsLoading } = useMessages(selectedChat);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !messageText.trim()) return;

    const scamPhrase = containsScamPhrase(messageText);
    if (scamPhrase) {
      toast.error(`⚠️ Message blocked: contains "${scamPhrase}". Off-platform transactions are not allowed.`, { duration: 5000 });
      return;
    }

    try {
      await sendMessage(selectedChat, messageText.trim());
      setMessageText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const getOtherParticipant = (conv: any) => {
    const participants = conv.conversation_participants || [];
    const other = participants.find((p: any) => p.user_id !== user?.id);
    return other?.profiles?.username || other?.profiles?.display_name || "Unknown";
  };

  const getLastMessage = (conv: any) => {
    // We don't have last_message preloaded, show creation time
    return formatDistanceToNow(new Date(conv.created_at), { addSuffix: true });
  };

  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true;
    return getOtherParticipant(conv).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find((c: any) => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-border bg-card flex-col`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 font-body text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-accent rounded-lg" />
                  ))}
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground mb-1">No conversations yet</p>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Start a conversation by requesting an item.
                </p>
                <Button variant="warmOutline" size="sm" asChild>
                  <Link to="/feed">Browse Items</Link>
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv: any) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`w-full p-4 text-left border-b border-border hover:bg-accent transition-colors ${selectedChat === conv.id ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                      {getOtherParticipant(conv)[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-body text-sm font-semibold text-foreground truncate">@{getOtherParticipant(conv)}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">{getLastMessage(conv)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Your Messages</h3>
              <p className="font-body text-sm text-muted-foreground max-w-xs">
                Select a conversation to start chatting, or request an item to begin a new conversation.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-b border-border bg-card flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="md:hidden flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xs">
                  {selectedConv ? getOtherParticipant(selectedConv)[0]?.toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">
                    @{selectedConv ? getOtherParticipant(selectedConv) : "Unknown"}
                  </p>
                </div>
              </div>

              {/* Safety banner */}
              <div className="px-4 py-2 bg-secondary/10 border-b border-secondary/20 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-secondary shrink-0" />
                <p className="font-body text-[11px] text-muted-foreground">
                  <strong>Safety:</strong> Never share money, bank details, or contact info outside this platform.
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground font-body animate-pulse">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-center">
                    <div>
                      <p className="font-body text-sm text-muted-foreground mb-1">No messages yet</p>
                      <p className="font-body text-xs text-muted-foreground">Say hello! 👋</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-accent text-foreground rounded-bl-sm"}`}>
                        <p className="font-body text-sm break-words">{msg.content}</p>
                        <p className={`font-body text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-border bg-card">
                <form className="flex gap-2" onSubmit={handleSend}>
                  <Input
                    placeholder="Type a message..."
                    className="flex-1 font-body"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    autoComplete="off"
                  />
                  <Button variant="hero" size="icon" type="submit" disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
