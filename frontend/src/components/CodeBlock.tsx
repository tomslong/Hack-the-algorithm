import { useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Register languages
SyntaxHighlighter.registerLanguage("python", python);

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "python", className }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className={cn("relative group my-4 rounded-md border overflow-hidden", className)}>
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={resolvedTheme === "dark" ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.9em",
          lineHeight: "1.6",
          backgroundColor: resolvedTheme === "dark" ? "#1e1e1e" : "#f5f5f5", // Ensure background matches theme
        }}
        codeTagProps={{
          style: {
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          },
        }}
        wrapLines={false} // Allow horizontal scrolling for long lines
        showLineNumbers={false} // Clean look, can be enabled if requested
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
