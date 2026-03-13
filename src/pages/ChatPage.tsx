import { Send, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useConversations, useMessages, sendMessage } from "@/lib/bonitarCloud";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const { user } = useAuth();
  const { conversations, loading: convsLoading } = useConversations();
  const { messages, loading: msgsLoading } = useMessages(selectedChat);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !messageText.trim()) return;
    try {
      await sendMessage(selectedChat, messageText.trim());
      setMessageText("");
    } catch {}
  };

  const getOtherParticipant = (conv: any) => {
    const participants = conv.conversation_participants || [];
    const other = participants.find((p: any) => p.user_id !== user?.id);
    return other?.profiles?.username || "Unknown";
  };

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
              <Input placeholder="Search conversations..." className="pl-10 font-body text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <p className="p-4 text-sm text-muted-foreground font-body">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground font-body">No conversations yet</p>
            ) : (
              conversations.map((conv: any) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`w-full p-4 text-left border-b border-border hover:bg-accent transition-colors ${selectedChat === conv.id ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-sm font-semibold text-foreground">@{getOtherParticipant(conv)}</span>
                    <span className="font-body text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-body">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <p className="text-sm text-muted-foreground font-body">Loading messages...</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-accent text-foreground rounded-bl-sm"}`}>
                        <p className="font-body text-sm">{msg.content}</p>
                        <p className={`font-body text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-border bg-card">
                <form className="flex gap-2" onSubmit={handleSend}>
                  <Input placeholder="Type a message..." className="flex-1 font-body" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                  <Button variant="hero" size="icon" type="submit">
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
