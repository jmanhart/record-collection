import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import "./styles/global.css";
import { initSentry } from "./config/sentry";
import App from "./App";

// Initialize Sentry before rendering
initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Set up HMR listener for article updates
if (import.meta.hot) {
  import.meta.hot.on("article-updated", (data: { recordId: string }) => {
    // Invalidate the specific article query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["article", Number(data.recordId)] });
    console.log(`🔄 Article ${data.recordId} updated - cache invalidated`);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
