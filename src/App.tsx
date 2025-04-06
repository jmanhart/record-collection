import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecordGrid } from "./components/RecordGrid";
import { useRecords } from "./hooks/useRecords";
import "./styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { records } = useRecords();

  return (
    <div className="app">
      <header>
        <h1>My Record Collection</h1>
        <p className="record-count">{records.length} records in collection</p>
      </header>
      <main>
        <RecordGrid />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
