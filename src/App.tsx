import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { RecordGrid } from "./components/RecordGrid/RecordGrid";
import { RecordDetail } from "./components/RecordDetail/RecordDetail";
import { useRecords } from "./hooks/useRecords";
import "./styles/global.css";

const queryClient = new QueryClient();

function RecordList() {
  const { records, isLoading, error } = useRecords();

  if (error) {
    return <div>Error loading records</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Record Collection</h1>
        <p className="record-count">
          {records?.length || 0} records in collection
        </p>
      </header>
      <main className="main">
        <RecordGrid records={records || []} isLoading={isLoading} />
      </main>
    </div>
  );
}

// Keep the error boundary for production error handling
const SentryErrorBoundary = Sentry.ErrorBoundary;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<RecordList />} />
          <Route path="/records/:id" element={<RecordDetail />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
