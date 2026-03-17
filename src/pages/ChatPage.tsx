import { Send, Search, ArrowLeft, MessageSquare, AlertTriangle } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useConversations, useMessages, sendMessage, markConversationAsRead } from "@/lib/bonitarCloud";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SCAM_PHRASES = [
  "send money",
  "transfer money",
  "delivery fee",
  "bank transfer",
  "whatsapp",
  "telegram",
  "pay first",
  "western union",
  "moneygram",
  "bitcoin",
  "crypto",
  "gift card",
  "cash app",
  "zelle",
];

const containsScamPhrase = (text: string): string | null => {
  const lower = text.toLowerCase();
  return SCAM_PHRASES.find((phrase) => lower.includes(phrase)) || null;
};

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(searchParams.get("conversation"));
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const { user } = useAuth();
  const { conversations, loading: convsLoading, refetch: refetchConversations } = useConversations();
  const { messages, loading: msgsLoading } = useMessages(selectedChat);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get("conversation");
    if (fromQuery && fromQuery !== selectedChat) {
      setSelectedChat(fromQuery);
    }
  }, [searchParams, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat) return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;

    void (async () => {
      await markConversationAsRead(selectedChat);
      await refetchConversations();
    })();
  }, [selectedChat, refetchConversations]);

  useEffect(() => {
    if (!selectedChat || !messages.length || !user?.id) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender_id !== user.id) {
      void (async () => {
        await markConversationAsRead(selectedChat);
        await refetchConversations();
      })();
    }
  }, [messages, selectedChat, user?.id, refetchConversations]);

  useEffect(() => {
    if (!selectedChat || !user?.id) return;

    const channel = supabase
      .channel(`typing:${selectedChat}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId !== user.id) {
          setIsOtherUserTyping(Boolean(payload?.isTyping));
        }
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[chat] typing channel subscription failed", { selectedChat });
        }
      });

    typingChannelRef.current = channel;

    return () => {
      setIsOtherUserTyping(false);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      void typingChannelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: user.id, isTyping: false },
      });
      void supabase.removeChannel(channel);
      typingChannelRef.current = null;
    };
  }, [selectedChat, user?.id]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv: any) => {
      if (!searchQuery) return true;
      const participants = conv.conversation_participants || [];
      const other = participants.find((p: any) => p.user_id !== user?.id);
      const otherName = other?.profiles?.username || other?.profiles?.display_name || "";
      return otherName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, user?.id]);

  const selectedConv = conversations.find((c: any) => c.id === selectedChat);

  const getOtherParticipant = (conv: any) => {
    const participants = conv.conversation_participants || [];
    const other = participants.find((p: any) => p.user_id !== user?.id);
    return other?.profiles?.display_name || other?.profiles?.username || "Unknown";
  };

  const openConversation = (conversationId: string) => {
    setSelectedChat(conversationId);
    const params = new URLSearchParams(searchParams);
    params.set("conversation", conversationId);
    setSearchParams(params, { replace: true });
  };

  const handleMessageInput = (value: string) => {
    setMessageText(value);

    if (!user?.id || !typingChannelRef.current || !selectedChat) return;

    void typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, isTyping: value.trim().length > 0 },
    });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      void typingChannelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: user.id, isTyping: false },
      });
    }, 1300);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChat || !messageText.trim()) return;

    const scamPhrase = containsScamPhrase(messageText);
    if (scamPhrase) {
      toast.error(`⚠️ Message blocked: contains "${scamPhrase}". Off-platform transactions are not allowed.`, {
        duration: 5000,
      });
      return;
    }

    try {
      await sendMessage(selectedChat, messageText.trim());
      setMessageText("");
      await markConversationAsRead(selectedChat);
      await refetchConversations();
      await typingChannelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: user?.id, isTyping: false },
      });
    } catch (error) {
      console.error("[chat] send failed", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 h-[calc(100dvh-4rem)] flex md:flex-row flex-col">
        {/* Sidebar */}
        <div
          className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-border bg-card flex-col min-h-0`}
        >
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

          <div className="flex-1 overflow-y-auto min-h-0">
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
                  onClick={() => openConversation(conv.id)}
                  className={`w-full p-4 text-left border-b border-border hover:bg-accent transition-colors ${
                    selectedChat === conv.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                      {getOtherParticipant(conv)[0]?.toUpperCase() || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <span className="font-body text-sm font-semibold text-foreground truncate">
                          @{getOtherParticipant(conv)}
                        </span>
                        <span className="font-body text-[11px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message?.created_at ?? conv.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="font-body text-xs text-muted-foreground truncate">
                          {conv.last_message?.content ?? "Start chatting"}
                        </p>
                        {!!conv.unread_count && conv.unread_count > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-body font-semibold shrink-0">
                            {conv.unread_count > 99 ? "99+" : conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 min-h-0 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
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
              <div className="p-3 border-b border-border bg-card flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xs">
                  {selectedConv ? getOtherParticipant(selectedConv)[0]?.toUpperCase() : "?"}
                </div>

                <div>
                  <p className="font-body text-sm font-semibold text-foreground">
                    @{selectedConv ? getOtherParticipant(selectedConv) : "Conversation"}
                  </p>
                  {isOtherUserTyping && (
                    <p className="font-body text-xs text-primary">typing...</p>
                  )}
                </div>
              </div>

              <div className="px-4 py-2 bg-secondary/10 border-b border-secondary/20 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-secondary shrink-0" />
                <p className="font-body text-[11px] text-muted-foreground">
                  <strong>Safety:</strong> Never share money, bank details, or contact info outside this platform.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
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
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                          msg.sender_id === user?.id
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-accent text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="font-body text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`font-body text-[10px] mt-1 ${
                            msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(msg.created_at), "p")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border bg-card p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                <form className="flex gap-2" onSubmit={handleSend}>
                  <Input
                    ref={inputRef}
                    placeholder="Type a message"
                    className="flex-1 font-body"
                    value={messageText}
                    onChange={(e) => handleMessageInput(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    inputMode="text"
                    enterKeyHint="send"
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