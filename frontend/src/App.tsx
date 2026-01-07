import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Topic } from "@/pages/Topic";
import { Problems } from "@/pages/Problems";
import { ProblemDetail } from "@/pages/ProblemDetail";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:category/:topicId" element={<Topic />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problem/:problemId" element={<ProblemDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
