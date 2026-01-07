export interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
}

export interface Content {
  data_structures: Topic[];
  algorithms: Topic[];
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starter_code: string;
  test_cases: TestCase[];
}

export interface ExecutionResult {
  test_case: number;
  input: string;
  expected: string;
  output: string;
  passed: boolean;
  execution_time: string;
  error?: string;
}

export interface SubmitResponse {
  success: boolean;
  all_passed: boolean;
  results: ExecutionResult[];
  error?: string;
}

export interface RunResponse {
  success: boolean;
  output: string;
  error: string;
  execution_time: string;
}

export interface LintMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: number;
}
