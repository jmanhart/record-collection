import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { RecordGrid } from "./components/RecordGrid/RecordGrid";
import { RecordDetail } from "./components/RecordDetail/RecordDetail";
import { Testing } from "./components/Testing/Testing";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { AlphabetIndicator } from "./components/AlphabetIndicator/AlphabetIndicator";
import { useRecords } from "./hooks/useRecords";
import "./App.css";

const queryClient = new QueryClient();

function RecordList() {
  const { records, isLoading, error } = useRecords();

  if (error) {
    return <div>Error loading records</div>;
  }

  return (
    <div className="app">
      <AlphabetIndicator records={records || []} />
      <div className="container">
        <header className="page-header">
          <h2>My Record Collection</h2>
          <h3 className="record-count">
            {records?.length || 0} records in collection
          </h3>
        </header>
        <main className="main">
          <RecordGrid records={records || []} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}

// Keep the error boundary for production error handling
const SentryErrorBoundary = Sentry.ErrorBoundary;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<RecordList />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/testing" element={<Testing />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
