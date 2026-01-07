import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import type { Problem, SubmitResponse, ExecutionResult } from "@/types";

export function ProblemDetail() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ExecutionResult[] | null>(null);
  const [activeTab, setActiveTab] = useState("description");

  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  useEffect(() => {
    fetch(`/api/problems/${problemId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch problem: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setProblem(data);
        setCode(data.starter_code);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load problem details.",
        });
        setLoading(false);
      });
  }, [problemId, toast]);

  const handleSubmit = async () => {
    if (!problem) return;

    setSubmitting(true);
    setResults(null);
    setActiveTab("results");

    try {
      const res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problem.id,
          code: code,
        }),
      });

      const data: SubmitResponse = await res.json();

      if (data.error) {
        toast({
          variant: "destructive",
          title: "Execution Error",
          description: data.error,
        });
      } else {
        setResults(data.results);
        if (data.all_passed) {
          toast({
            title: "Success!",
            description: "All test cases passed successfully.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Failed",
            description: "Some test cases failed. Check the results tab.",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to submit code.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Problem not found</h2>
        <Button onClick={() => navigate("/problems")}>Back to Problems</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row">
      {/* Left Panel: Description & Results */}
      <div className="flex h-full w-full flex-col gap-4 lg:w-1/2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2"
            onClick={() => navigate("/problems")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Badge variant="outline">{problem.difficulty}</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="h-[calc(100%-3rem)]">
            <Card className="h-full border-0 shadow-none">
              <ScrollArea className="h-full pr-4">
                <CardHeader className="px-0">
                  <CardTitle className="text-2xl">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {problem.description}
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <h3 className="font-semibold">Example Test Cases:</h3>
                    {problem.test_cases.slice(0, 2).map((testCase, idx) => (
                      <div key={idx} className="rounded-lg bg-muted p-4 text-sm">
                        <div className="mb-2">
                          <span className="font-medium">Input:</span>{" "}
                          <code className="rounded bg-background px-1 py-0.5">
                            {testCase.input}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Output:</span>{" "}
                          <code className="rounded bg-background px-1 py-0.5">
                            {testCase.expected}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="h-[calc(100%-3rem)]">
            <Card className="h-full border-0 shadow-none">
              <ScrollArea className="h-full pr-4">
                <CardHeader className="px-0">
                  <CardTitle>Execution Results</CardTitle>
                  <CardDescription>
                    {results
                      ? results.every((r) => r.passed)
                        ? "All tests passed!"
                        : "Some tests failed."
                      : "Run your code to see results."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  {results?.map((result, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-4 ${
                        result.passed
                          ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                          <span className="font-medium">Test Case {result.test_case}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.execution_time}
                        </span>
                      </div>
                      
                      {result.error ? (
                        <div className="mt-2 rounded bg-background p-2 text-sm text-destructive font-mono">
                          {result.error}
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-[80px_1fr] gap-2">
                            <span className="text-muted-foreground">Input:</span>
                            <code className="font-mono">{result.input}</code>
                          </div>
                          <div className="grid grid-cols-[80px_1fr] gap-2">
                            <span className="text-muted-foreground">Expected:</span>
                            <code className="font-mono">{result.expected}</code>
                          </div>
                          <div className="grid grid-cols-[80px_1fr] gap-2">
                            <span className="text-muted-foreground">Output:</span>
                            <code className="font-mono">{result.output}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel: Code Editor */}
      <div className="flex h-[500px] w-full flex-col gap-4 lg:h-full lg:w-1/2">
        <div className="flex items-center justify-between rounded-lg border bg-card p-2">
          <span className="px-2 text-sm font-medium">Python 3.8</span>
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Code
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden rounded-lg border bg-card">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme={monacoTheme}
            value={code}
            onChange={(value) => setCode(value || "")}
            loading={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
