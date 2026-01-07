import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Problem } from "@/types";

export function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/problems")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch problems: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Problems</h1>
        <p className="text-muted-foreground">
          Sharpen your skills with our collection of algorithmic challenges.
        </p>
      </div>

      <div className="grid gap-4">
        {problems.map((problem, index) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/problem/${problem.id}`}>
              <Card className="transition-all hover:bg-muted/50 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{problem.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {problem.description.split('\n')[0]}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
