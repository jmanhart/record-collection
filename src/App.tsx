import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecordGrid } from "./components/RecordGrid";
import { useRecords } from "./hooks/useRecords";
import "./styles/global.css";

const queryClient = new QueryClient();

function AppContent() {
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
