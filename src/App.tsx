import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { RecordGrid } from "./components/RecordGrid/RecordGrid";
import { RecordDetail } from "./components/RecordDetail/RecordDetail";
import { ListenRedirect } from "./components/ListenRedirect/ListenRedirect";
import { Testing } from "./components/Testing/Testing";
import { AdminGate } from "./components/AdminGate/AdminGate";
import { AdminPanel } from "./components/AdminPanel/AdminPanel";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { AdminFab } from "./components/AdminFab/AdminFab";
import { ArtistProgressList } from "./components/ArtistProgress/ArtistProgressList";
import { ArtistProgressDetail } from "./components/ArtistProgress/ArtistProgressDetail";
import { Timeline } from "./components/Timeline/Timeline";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { AlphabetIndicator } from "./components/AlphabetIndicator/AlphabetIndicator";
import { Tabs, type TabValue } from "./components/Tabs/Tabs";
import { WishlistList } from "./components/WishlistList/WishlistList";
import { useRecords } from "./hooks/useRecords";
import { useWishlist } from "./hooks/useWishlist";
import { formatRuntime } from "./utils/formatDuration";
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

  const totalDuration = isCollection
    ? (records?.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) || 0)
    : 0;
  const runtime = formatRuntime(totalDuration);
  const runtimeSuffix = runtime ? `${runtime} of music` : "";

  const subtitle = isCollection
    ? `${records?.length || 0} records in collection${runtimeSuffix ? ` · ${runtimeSuffix}` : ""}`
    : activeTab === "wishlist"
    ? `${wishlistRecords?.length || 0} records on wishlist`
    : activeTab === "timeline"
    ? "Recent listening activity"
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
          {activeTab === "timeline" ? (
            <Timeline />
          ) : activeTab === "collection" ? (
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
      <AdminAuthProvider>
        <Router>
          <ThemeToggle />
          <AdminFab />
          <Routes>
            <Route path="/" element={<RecordList />} />
            <Route path="/listen/:uid" element={<ListenRedirect />} />
            <Route path="/:artist/:album" element={<RecordDetail />} />
            <Route path="/testing" element={<Testing />} />
            <Route
              path="/admin"
              element={
                <AdminGate>
                  <AdminPanel />
                </AdminGate>
              }
            />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </Sentry.ErrorBoundary>
  );
}
