import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Book, Cpu } from "lucide-react";
import type { Content } from "@/types";

export function Home() {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch content: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load content. Please make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid gap-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-32 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Master Algorithms & Data Structures
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Learn the fundamentals of computer science through interactive lessons and
          coding challenges.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Data Structures</h2>
          </div>
          <div className="grid gap-4">
            {content?.data_structures.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/learn/data_structures/${topic.id}`}>
                  <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        {topic.title}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Algorithms</h2>
          </div>
          <div className="grid gap-4">
            {content?.algorithms.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/learn/algorithms/${topic.id}`}>
                  <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        {topic.title}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
