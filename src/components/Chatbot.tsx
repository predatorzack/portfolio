import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, User, Mic, MicOff, Loader2, Volume2, VolumeX, ChevronDown, Square } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AudioWaveform from "./AudioWaveform";
import { useToast } from "@/hooks/use-toast";
import chatbotIcon from "@/assets/chatbot-icon.avif";
import profileImg from "@/assets/profile.jpg";
type Message = {
  role: "user" | "assistant";
  content: string;
};
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-chat`;
const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-transcribe`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;
const QUICK_REPLIES = ["What's your experience?", "Tell me about your expertise", "What is HeyAlpha?", "Where did you study?"];
const VOICE_OPTIONS = [{
  id: 'alloy',
  label: 'Alloy'
}, {
  id: 'echo',
  label: 'Echo'
}, {
  id: 'fable',
  label: 'Fable'
}, {
  id: 'nova',
  label: 'Nova'
}, {
  id: 'onyx',
  label: 'Onyx'
}, {
  id: 'shimmer',
  label: 'Shimmer'
}];
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hey! I'm Sohit. Ask me anything about my experience, skills, or background! You can also use the mic to speak."
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    toast
  } = useToast();
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
        })
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
      // Speak the response if TTS is enabled
      if (assistantContent && ttsEnabled) {
        speakText(assistantContent);
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
  const speakText = async (text: string) => {
    if (!text.trim()) return;

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(true);
    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice
        })
      });
      if (!response.ok) {
        throw new Error('TTS failed');
      }
      const data = await response.json();
      const audioData = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioData);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech.",
        variant: "destructive"
      });
    }
  };
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });
        await transcribeAudio(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording",
        description: "Speak now..."
      });
    } catch (error) {
      console.error("Microphone error:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const response = await fetch(TRANSCRIBE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            audio: base64Audio
          })
        });
        if (!response.ok) {
          throw new Error('Transcription failed');
        }
        const data = await response.json();
        if (data.text && data.text.trim()) {
          setShowSuggestions(false);
          sendMessageWithText(data.text);
        } else {
          toast({
            title: "No speech detected",
            description: "Please try speaking again.",
            variant: "destructive"
          });
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      });
      setIsTranscribing(false);
    }
  };
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowSuggestions(false);
    sendMessageWithText(input);
  };
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  return <>
    {/* Floating Chat Button */}
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {!isOpen && (
        <span className="bg-accent text-accent-foreground text-sm font-semibold px-3 py-1 rounded-full shadow-md animate-bounce-gentle">
          Ask Me
        </span>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`h-24 w-24 rounded-full bg-accent hover:bg-accent/90 shadow-lg shadow-accent/25 flex items-center justify-center transition-transform hover:scale-105 overflow-hidden ${!isOpen ? 'animate-subtle-bounce animate-glow' : ''}`}>
        {isOpen ? <X size={32} className="text-accent-foreground" /> : <img src={chatbotIcon} alt="Chat" className="h-full w-full object-cover" />}
      </button>
    </div>

    {/* Chat Window */}
    {isOpen && <Card className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] h-[500px] flex flex-col border-accent/30 shadow-xl shadow-accent/10 animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileImg} alt="Sohit Kumar" />
                <AvatarFallback className="bg-accent/20 text-accent">SK</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-['Space_Grotesk'] font-semibold text-foreground">Ask Sohit </h3>
                
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground" disabled={!ttsEnabled}>
                    {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.label}
                    <ChevronDown size={12} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {VOICE_OPTIONS.map(voice => <DropdownMenuItem key={voice.id} onClick={() => setSelectedVoice(voice.id)} className={selectedVoice === voice.id ? 'bg-accent/20' : ''}>
                      {voice.label}
                    </DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
              {isSpeaking ? <Button variant="ghost" size="sm" onClick={stopSpeaking} className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1" title="Stop speaking">
                  <Square size={12} className="fill-current" />
                  <AudioWaveform />
                </Button> : <Button variant="ghost" size="icon" onClick={() => setTtsEnabled(!ttsEnabled)} className={`h-8 w-8 ${ttsEnabled ? 'text-accent' : 'text-muted-foreground'}`} title={ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}>
                  {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </Button>}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={profileImg} alt="Sohit" />
                  <AvatarFallback className="bg-accent/20 text-accent text-xs">SK</AvatarFallback>
                </Avatar>}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === "user" ? "bg-accent text-accent-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"}`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>}
            </div>)}
          {isLoading && messages[messages.length - 1]?.role === "user" && <div className="flex gap-2 justify-start">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={profileImg} alt="Sohit" />
                <AvatarFallback className="bg-accent/20 text-accent text-xs">SK</AvatarFallback>
              </Avatar>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>}
          
        </div>

        {/* Quick Replies */}
        {showSuggestions && !isLoading && <div className="px-4 pb-2 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((question, index) => <button key={index} onClick={() => handleQuickReply(question)} className="text-xs px-3 py-1.5 rounded-full border border-accent/30 hover:bg-accent/10 transition-colors text-[#2cacbf]">
                {question}
              </button>)}
          </div>}

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." disabled={isLoading || isRecording || isTranscribing} className="flex-1 bg-secondary border-border focus-visible:ring-accent" />
            <Button type="button" size="icon" onClick={handleMicClick} disabled={isLoading || isTranscribing} className={`${isRecording ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}`}>
              {isTranscribing ? <Loader2 size={18} className="animate-spin" /> : isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isRecording || isTranscribing} className="text-accent-foreground bg-accent">
              <Send size={18} />
            </Button>
          </div>
        </form>
      </Card>}
  </>;
};
export default Chatbot;