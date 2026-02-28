import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { RecordGrid } from "./components/RecordGrid/RecordGrid";
import { RecordDetail } from "./components/RecordDetail/RecordDetail";
import { Testing } from "./components/Testing/Testing";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { AlphabetIndicator } from "./components/AlphabetIndicator/AlphabetIndicator";
import { useRecords } from "./hooks/useRecords";
import "./App.css";

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

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <Router>
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<RecordList />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/testing" element={<Testing />} />
        </Routes>
      </Router>
    </Sentry.ErrorBoundary>
  );
}
