import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import chatbotIcon from "@/assets/chatbot-icon.avif";
type Message = {
  role: "user" | "assistant";
  content: string;
};
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-chat`;
const QUICK_REPLIES = ["What's your experience?", "Tell me about your expertise", "What is HeyAlpha?", "Where did you study?"];
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I'm Sohit's AI assistant. Ask me anything about his experience, skills, or background!"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleQuickReply = (question: string) => {
    setShowSuggestions(false);
    sendMessageWithText(question);
  };
  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = {
      role: "user",
      content: text.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    let assistantContent = "";
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(1)
        }) // Exclude initial greeting
      });
      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
          stream: true
        });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) => i === prev.length - 1 ? {
                    ...m,
                    content: assistantContent
                  } : m);
                }
                return [...prev, {
                  role: "assistant",
                  content: assistantContent
                }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowSuggestions(false);
    sendMessageWithText(input);
  };
  return <>
      {/* Floating Chat Button */}
      <button onClick={() => setIsOpen(!isOpen)} className={`fixed bottom-6 right-6 z-50 h-24 w-24 rounded-full bg-accent hover:bg-accent/90 shadow-lg shadow-accent/25 flex items-center justify-center transition-transform hover:scale-105 overflow-hidden ${!isOpen ? 'animate-subtle-bounce animate-glow' : ''}`}>
        {isOpen ? <X size={32} className="text-accent-foreground" /> : <img src={chatbotIcon} alt="Chat" className="h-full w-full object-cover" />}
      </button>

      {/* Chat Window */}
      {isOpen && <Card className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] h-[500px] flex flex-col border-accent/30 shadow-xl shadow-accent/10 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] font-semibold text-foreground">Chat with AI</h3>
                <p className="text-xs text-muted-foreground">Ask about Sohit's experience</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === "user" ? "bg-accent text-accent-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>}
              </div>)}
            {isLoading && messages[messages.length - 1]?.role === "user" && <div className="flex gap-2 justify-start">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showSuggestions && !isLoading && <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((question, index) => <button key={index} onClick={() => handleQuickReply(question)} className="text-xs px-3 py-1.5 rounded-full border border-accent/30 hover:bg-accent/10 transition-colors text-[#27626a]">
                  {question}
                </button>)}
            </div>}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." disabled={isLoading} className="flex-1 bg-secondary border-border focus-visible:ring-accent" />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Send size={18} />
              </Button>
            </div>
          </form>
        </Card>}
    </>;
};
export default Chatbot;