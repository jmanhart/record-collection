import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { RecordGrid } from "./components/RecordGrid/RecordGrid";
import { RecordDetail } from "./components/RecordDetail/RecordDetail";
import { Testing } from "./components/Testing/Testing";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { AlphabetIndicator } from "./components/AlphabetIndicator/AlphabetIndicator";
import { Tabs, type TabValue } from "./components/Tabs/Tabs";
import { WishlistList } from "./components/WishlistList/WishlistList";
import { useRecords } from "./hooks/useRecords";
import { useWishlist } from "./hooks/useWishlist";
import "./App.css";

function RecordList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabValue) || "collection";

  const { records, isLoading: isLoadingRecords, error: recordsError } = useRecords();
  const { records: wishlistRecords, isLoading: isLoadingWishlist, error: wishlistError } = useWishlist();

  const handleTabChange = (tab: TabValue) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "collection") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    setSearchParams(params);
  };

  const error = activeTab === "collection" ? recordsError : wishlistError;
  if (error) {
    return <div>Error loading records</div>;
  }

  const isCollection = activeTab === "collection";
  const currentRecords = isCollection ? records : wishlistRecords;
  const subtitle = isCollection
    ? `${records?.length || 0} records in collection`
    : `${wishlistRecords?.length || 0} records on wishlist`;

  return (
    <div className="app">
      {isCollection && <AlphabetIndicator records={records || []} />}
      <div className="container">
        <header className="page-header">
          <h2>My Record Collection</h2>
          <h3 className="record-count">{subtitle}</h3>
        </header>
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="main">
          {isCollection ? (
            <RecordGrid records={currentRecords || []} isLoading={isLoadingRecords} />
          ) : (
            <WishlistList records={currentRecords || []} isLoading={isLoadingWishlist} />
          )}
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
