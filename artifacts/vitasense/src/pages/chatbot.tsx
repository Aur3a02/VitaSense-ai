import { useState, useRef, useEffect } from "react";
import { 
  useListOpenaiConversations, 
  getListOpenaiConversationsQueryKey,
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey
} from "@workspace/api-client-react";
import { AppShell } from "@/components/app-shell";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus, Trash2, Loader2, User, Bot, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Chatbot() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversations, isLoading: loadingConvos } = useListOpenaiConversations({ query: { queryKey: getListOpenaiConversationsQueryKey() } });
  
  // Set first conversation active by default if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const { data: messages, isLoading: loadingMessages } = useListOpenaiMessages(
    activeId!, 
    { query: { enabled: !!activeId, queryKey: getListOpenaiMessagesQueryKey(activeId!) } }
  );

  const createMutation = useCreateOpenaiConversation();
  const deleteMutation = useDeleteOpenaiConversation();

  const handleNewChat = () => {
    createMutation.mutate(
      { data: { title: "New Health Chat" } },
      {
        onSuccess: (convo) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          setActiveId(convo.id);
        }
      }
    );
  };

  const handleDeleteChat = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          if (activeId === id) setActiveId(null);
        }
      }
    );
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId || isStreaming) return;

    const userText = input.trim();
    setInput("");
    
    // Optimistically add user message to cache
    const currentMessages = queryClient.getQueryData<any>(getListOpenaiMessagesQueryKey(activeId)) || [];
    queryClient.setQueryData(getListOpenaiMessagesQueryKey(activeId), [
      ...currentMessages, 
      { id: Date.now(), role: "user", content: userText, createdAt: new Date().toISOString() }
    ]);

    setIsStreaming(true);
    setStreamingMessage("");

    try {
      const response = await fetch(`/api/openai/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: userText })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";

      while (reader && !done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || "";
                fullResponse += content;
                setStreamingMessage(fullResponse);
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }

      // Refresh messages fully after stream ends
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(activeId) });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to communicate with AI.",
        variant: "destructive"
      });
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(activeId) });
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  return (
    <AppShell>
    <div className="p-4 h-[calc(100vh-3.5rem)] flex gap-4 max-w-6xl mx-auto">
      
      {/* Sidebar for conversations */}
      <Card className="w-1/3 max-w-[300px] flex flex-col hidden md:flex border-border overflow-hidden bg-sidebar">
        <div className="p-4 border-b border-border flex justify-between items-center bg-sidebar">
          <h2 className="font-semibold text-sidebar-foreground">Conversations</h2>
          <Button size="icon" variant="ghost" onClick={handleNewChat} disabled={createMutation.isPending}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvos ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
          ) : conversations?.map((convo) => (
            <div 
              key={convo.id} 
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-colors ${activeId === convo.id ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50 text-muted-foreground'}`}
              onClick={() => setActiveId(convo.id)}
            >
              <div className="truncate pr-2">
                <div className="truncate">{convo.title || "Health Chat"}</div>
                <div className="text-xs opacity-70 mt-1">{format(new Date(convo.createdAt), "MMM d, yyyy")}</div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(convo.id); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col border-border overflow-hidden bg-card">
        {activeId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              <div className="bg-primary/10 text-primary-foreground/80 dark:text-primary-foreground p-4 rounded-lg flex gap-3 text-sm max-w-3xl mx-auto border border-primary/20">
                <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                <p className="text-primary">VitaSense Chatbot provides educational information. For medical emergencies or formal diagnoses, please consult a healthcare professional.</p>
              </div>

              {loadingMessages ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
              ) : messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/50 text-foreground border border-border rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%] flex-row">
                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/50 text-foreground border border-border rounded-tl-sm whitespace-pre-wrap">
                      {streamingMessage}
                      <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a health question..."
                  className="flex-1 bg-background"
                  disabled={isStreaming}
                />
                <Button type="submit" disabled={isStreaming || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <Bot className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
            <p className="mb-6">Select an existing chat or start a new one to begin.</p>
            <Button onClick={handleNewChat} disabled={createMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" /> Start New Chat
            </Button>
          </div>
        )}
      </Card>
    </div>
    </AppShell>
  );
}
