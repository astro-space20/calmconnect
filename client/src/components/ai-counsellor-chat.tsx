import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import type { ThoughtJournal } from "@shared/schema";

interface Message {
  id: string;
  role: 'user' | 'counsellor';
  content: string;
  timestamp: Date;
}

interface AICounsellorChatProps {
  journalEntry?: ThoughtJournal;
}

export default function AICounsellorChat({ journalEntry }: AICounsellorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const counsellorMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/ai-counsellor/chat", {
        message: userMessage,
        journalEntry: journalEntry ? {
          situation: journalEntry.situation,
          negativeThought: journalEntry.negativeThought,
          emotion: journalEntry.emotion,
          emotionIntensity: journalEntry.emotionIntensity,
          reframing: journalEntry.reframing
        } : null,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      return response.json();
    },
    onSuccess: (data) => {
      const counsellorMessage: Message = {
        id: Date.now().toString() + '_counsellor',
        role: 'counsellor',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, counsellorMessage]);
    },
    onError: (error) => {
      console.error("Failed to get counsellor response:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'counsellor',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    counsellorMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const initializeChat = () => {
    setIsOpen(true);
    if (messages.length === 0 && journalEntry) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'counsellor',
        content: `Hello! I'm your AI wellness counsellor. I've reviewed your journal entry about "${journalEntry.situation}". I'm here to provide a safe space to discuss your thoughts and feelings. What would you like to explore together?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'counsellor',
        content: "Hello! I'm your AI wellness counsellor. I'm here to provide support and guidance for your mental wellness journey. How are you feeling today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={initializeChat}
          className="w-full gradient-bg hover:opacity-90"
          data-testid="button-ai-counsellor"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with AI Counsellor
        </Button>
      ) : (
        <Card className="bg-white border shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-primary" />
                <span>AI Wellness Counsellor</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-auto"
                data-testid="button-close-chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 px-4 overflow-y-auto" ref={scrollAreaRef}>
              <div className="space-y-3 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {counsellorMutation.isPending && (
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t p-4">
              <div className="flex items-end space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  className="flex-1"
                  disabled={counsellorMutation.isPending}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || counsellorMutation.isPending}
                  size="sm"
                  className="px-3"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is an AI counsellor for support. For crisis situations, please contact emergency services.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}