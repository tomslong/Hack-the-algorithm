import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/theme-provider";
import { Send, Play, Bot, User, Loader2, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  "Arrays", "Linked Lists", "Stacks & Queues", "Trees", 
  "Recursion", "Dynamic Programming", "Sorting", "Searching", "General"
];

const MODES = [
  { value: "tutor", label: "Standard Tutor" },
  { value: "socratic", label: "Socratic Method" },
  { value: "challenge", label: "Coding Challenge" },
];

const LLM_MODELS = [
  { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
  { value: "gpt-4o-mini", label: "gpt-4o-mini" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Tutor() {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI Algorithm Tutor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("tutor");
  const [topic, setTopic] = useState("General");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Sandbox state
  const [code, setCode] = useState("# Write your python code here\nprint('Hello World')");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, mode, topic, model }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to get response", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
    setLoading(false);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.output || "No output");
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setOutput("Failed to run code");
    }
    setRunning(false);
  };

  const evaluateCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    
    // Add user message to chat to show what is happening
    setMessages(prev => [...prev, { role: "user", content: "Please evaluate my code." }]);

    const prompt = `Please evaluate the following python code for the topic '${topic}'. 
Check for correctness, efficiency, and potential bugs. Provide feedback and a score out of 10.

Code:
\`\`\`python
${code}
\`\`\`
`;

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, mode: "tutor", topic, model }), 
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        toast({ title: "Error", description: "Failed to evaluate", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="container py-6 h-[calc(100vh-3.5rem)] flex flex-col gap-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Algorithm Tutor</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {MODES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              {LLM_MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Chat Area */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm font-medium">Chat Session</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="h-4 w-4" /></div>}
                    <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center"><User className="h-4 w-4 text-primary-foreground" /></div>}
                  </div>
                ))}
                {loading && (
                   <div className="flex gap-2 justify-start">
                     <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="h-4 w-4" /></div>
                     <div className="bg-muted rounded-lg p-3">
                       <Loader2 className="h-4 w-4 animate-spin" />
                     </div>
                   </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <Input 
                placeholder="Type your message..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sandbox Area */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center space-y-0">
            <CardTitle className="text-sm font-medium">Algorithm Sandbox</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={evaluateCode} disabled={loading || running}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Evaluate
              </Button>
              <Button size="sm" onClick={runCode} disabled={running}>
                {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Run
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(val) => setCode(val || "")}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
            <Separator />
            <div className="h-[30%] min-h-[100px] bg-muted/50 p-4 font-mono text-sm overflow-auto">
              <div className="text-xs text-muted-foreground mb-1">Output:</div>
              <pre>{output}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
