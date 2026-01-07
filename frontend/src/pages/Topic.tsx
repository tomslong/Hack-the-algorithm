import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import type { Content, Topic as TopicType } from "@/types";

export function Topic() {
  const { category, topicId } = useParams<{ category: string; topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<TopicType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch content: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: Content) => {
        const categoryData = data[category as keyof Content];
        if (!categoryData) {
          setError("Category not found");
          setLoading(false);
          return;
        }
        
        const foundTopic = categoryData.find((t) => t.id === topicId);
        if (foundTopic) {
          setTopic(foundTopic);
        } else {
          setError("Topic not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load topic");
        setLoading(false);
      });
  }, [category, topicId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">
          {error || "Topic not found"}
        </h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(topic.content);

  const options = {
    replace: (domNode: any) => {
      if (domNode.type === 'tag' && domNode.name === 'pre') {
        const codeNode = domNode.children.find((c: any) => c.type === 'tag' && c.name === 'code');
        if (codeNode && codeNode.children && codeNode.children.length > 0) {
            const textContent = codeNode.children.map((c: any) => c.data || '').join('');
            return <CodeBlock code={textContent} language="python" />;
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl space-y-8"
    >
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="-ml-4 gap-2 text-muted-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
          <p className="text-xl text-muted-foreground">{topic.description}</p>
        </div>
      </div>
      
      <div className="prose prose-slate max-w-none dark:prose-invert">
        {parse(sanitizedContent, options)}
      </div>
    </motion.div>
  );
}
