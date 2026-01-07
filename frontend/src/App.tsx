import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

const Problems = lazy(() => import("@/pages/Problems").then(module => ({ default: module.Problems })));
const ProblemDetail = lazy(() => import("@/pages/ProblemDetail").then(module => ({ default: module.ProblemDetail })));
const Home = lazy(() => import("@/pages/Home").then(module => ({ default: module.Home })));
const Topic = lazy(() => import("@/pages/Topic").then(module => ({ default: module.Topic })));
const AISettings = lazy(() => import("@/pages/AISettings").then(module => ({ default: module.AISettings })));
const Tutor = lazy(() => import("@/pages/Tutor").then(module => ({ default: module.Tutor })));

function LoadingFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/learn/:category/:topicId" element={<Topic />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problem/:problemId" element={<ProblemDetail />} />
              <Route path="/settings" element={<AISettings />} />
              <Route path="/tutor" element={<Tutor />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
