import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home").then(module => ({ default: module.Home })));
const Topic = lazy(() => import("@/pages/Topic").then(module => ({ default: module.Topic })));
const Problems = lazy(() => import("@/pages/Problems").then(module => ({ default: module.Problems })));
const ProblemDetail = lazy(() => import("@/pages/ProblemDetail").then(module => ({ default: module.ProblemDetail })));

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
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
