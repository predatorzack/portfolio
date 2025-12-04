import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, User, Mic, MicOff, Loader2, Volume2, VolumeX, ChevronDown, Square } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AudioWaveform from "./AudioWaveform";
import { useToast } from "@/hooks/use-toast";
import profileImg from "@/assets/profile.jpg";
type Message = {
  role: "user" | "assistant";
  content: string;
};
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-chat`;
const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-transcribe`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;
const QUICK_REPLIES = ["What's your experience?", "Tell me about your expertise", "What is HeyAlpha?", "Where did you study?", "आपकी स्किल्स क्या हैं?", "¿Qué productos has creado?"];
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
const EmbeddedChat = () => {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hey! I'm Sohit. Feel free to ask me anything about my experience, skills, or background!"
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
      if (!response.ok || !response.body) throw new Error("Failed to get response");
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
      if (assistantContent && ttsEnabled) {
        speakText(assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const speakText = async (text: string) => {
    if (!text.trim()) return;
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
      if (!response.ok) throw new Error('TTS failed');
      const data = await response.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
        description: "Speak now... Press the mic icon again to stop and process."
      });
    } catch (error) {
      console.error("Microphone error:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone.",
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
        if (!response.ok) throw new Error('Transcription failed');
        const data = await response.json();
        if (data.text?.trim()) {
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
        description: "Failed to transcribe audio.",
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
    if (isRecording) stopRecording();else startRecording();
  };
  return <Card className="w-full h-[450px] flex flex-col shadow-xl shadow-accent/10 animate-fade-in border-muted-foreground">
      {/* Header */}
      <div className="p-3 border-b border-border bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImg} alt="Sohit Kumar" />
              <AvatarFallback className="bg-accent/20 text-accent text-xs">SK</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-['Space_Grotesk'] font-semibold text-foreground text-sm">Ask Sohit</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" disabled={!ttsEnabled}>
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
            {isSpeaking ? <Button variant="ghost" size="sm" onClick={stopSpeaking} className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1" title="Stop speaking">
                <Square size={10} className="fill-current" />
                <AudioWaveform />
              </Button> : <Button variant="ghost" size="icon" onClick={() => setTtsEnabled(!ttsEnabled)} className={`h-7 w-7 ${ttsEnabled ? 'text-accent' : 'text-muted-foreground'}`} title={ttsEnabled ? 'Disable voice' : 'Enable voice'}>
                {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </Button>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={profileImg} alt="Sohit" />
                <AvatarFallback className="bg-accent/20 text-accent text-[10px]">SK</AvatarFallback>
              </Avatar>}
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${message.role === "user" ? "bg-accent text-accent-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"}`}>
              <p className="text-xs whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <User className="h-3 w-3 text-accent-foreground" />
              </div>}
          </div>)}
        {isLoading && messages[messages.length - 1]?.role === "user" && <div className="flex gap-2 justify-start">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={profileImg} alt="Sohit" />
              <AvatarFallback className="bg-accent/20 text-accent text-[10px]">SK</AvatarFallback>
            </Avatar>
            <div className="bg-secondary rounded-2xl rounded-bl-md px-3 py-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>}
        
      </div>

      {/* Quick Replies */}
      {showSuggestions && !isLoading && <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((question, index) => <button key={index} onClick={() => handleQuickReply(question)} className="text-[10px] px-2 py-1 rounded-full border border-accent/30 hover:bg-accent/10 transition-colors text-[#2cacbf]">
              {question}
            </button>)}
        </div>}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." disabled={isLoading || isRecording || isTranscribing} className="flex-1 bg-secondary border-border focus-visible:ring-accent text-sm h-9" />
          <Button type="button" size="icon" onClick={handleMicClick} disabled={isLoading || isTranscribing} className={`h-9 w-9 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent hover:bg-accent/90'}`}>
            {isTranscribing ? <Loader2 size={16} className="animate-spin" /> : isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isRecording || isTranscribing} className="h-9 w-9 bg-accent">
            <Send size={16} />
          </Button>
        </div>
      </form>
    </Card>;
};
export default EmbeddedChat;