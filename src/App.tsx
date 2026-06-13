import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { RecordGrid } from "./components/RecordGrid/RecordGrid";
import { RecordDetail } from "./components/RecordDetail/RecordDetail";
import { Testing } from "./components/Testing/Testing";
import { ArtistProgressList } from "./components/ArtistProgress/ArtistProgressList";
import { ArtistProgressDetail } from "./components/ArtistProgress/ArtistProgressDetail";
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
  const artistSlug = searchParams.get("artist");

  const { records, isLoading: isLoadingRecords, error: recordsError } = useRecords();
  const { records: wishlistRecords, isLoading: isLoadingWishlist, error: wishlistError } = useWishlist();

  const handleTabChange = (tab: TabValue) => {
    const params = new URLSearchParams();
    if (tab !== "collection") {
      params.set("tab", tab);
    }
    setSearchParams(params);
  };

  const handleArtistSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("artist", slug);
    setSearchParams(params);
  };

  const handleArtistBack = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("artist");
    setSearchParams(params);
  };

  const error = activeTab === "collection" ? recordsError : activeTab === "wishlist" ? wishlistError : null;
  if (error) {
    return <div>Error loading records</div>;
  }

  const isCollection = activeTab === "collection";

  const formatRuntime = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return "";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours} hours${minutes > 0 ? ` ${minutes} min` : ""} of music`;
    return `${minutes} min of music`;
  };

  const totalDuration = isCollection
    ? (records?.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) || 0)
    : 0;
  const runtimeSuffix = formatRuntime(totalDuration);

  const subtitle = isCollection
    ? `${records?.length || 0} records in collection${runtimeSuffix ? ` · ${runtimeSuffix}` : ""}`
    : activeTab === "wishlist"
    ? `${wishlistRecords?.length || 0} records on wishlist`
    : "Tracking progress on artist discographies";

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
          {activeTab === "collection" ? (
            <RecordGrid records={records || []} isLoading={isLoadingRecords} />
          ) : activeTab === "wishlist" ? (
            <WishlistList records={wishlistRecords || []} isLoading={isLoadingWishlist} />
          ) : artistSlug ? (
            <ArtistProgressDetail artistSlug={artistSlug} onBack={handleArtistBack} />
          ) : (
            <ArtistProgressList onArtistSelect={handleArtistSelect} />
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
          <Route path="/:artist/:album" element={<RecordDetail />} />
          <Route path="/testing" element={<Testing />} />
        </Routes>
      </Router>
    </Sentry.ErrorBoundary>
  );
}
