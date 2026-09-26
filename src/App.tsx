import { lazy, Suspense, useState } from "react";
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
import { AlphabetIndicator } from "./components/AlphabetIndicator/AlphabetIndicator";
import { AppBar } from "./components/AppBar/AppBar";
import { TimelineFeed } from "./components/Timeline/TimelineFeed";
import { ViewNav } from "./components/ViewNav/ViewNav";
import TopListens from "./components/TopListens/TopListens";
import type { TabValue } from "./components/Tabs/Tabs";
import { WishlistList } from "./components/WishlistList/WishlistList";
import { useRecords } from "./hooks/useRecords";
import { useWishlist } from "./hooks/useWishlist";
import "./App.css";

// Lazy so the collection bundle doesn't pay for the charting library
const HomePage = lazy(() => import("./components/Home/HomePage"));
const TimelinePage = lazy(() => import("./components/Timeline/TimelinePage"));

function RecordList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabValue) || "collection";
  const artistSlug = searchParams.get("artist");
  const [search, setSearch] = useState("");
  const view = searchParams.get("view") === "timeline" ? "timeline" : "grid";

  const { records, isLoading: isLoadingRecords, error: recordsError } = useRecords();
  const { records: wishlistRecords, isLoading: isLoadingWishlist, error: wishlistError } = useWishlist();

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

  return (
    <div className="app">
      <AppBar
        search={search}
        onSearchChange={setSearch}
        showSearch={!(isCollection && view === "timeline")}
        hasHero={isCollection && view === "timeline"}
      />
      {isCollection && <ViewNav />}
      {isCollection && view === "grid" && <AlphabetIndicator records={records || []} />}
      <div className="container">
        <main className="main">
          {activeTab === "collection" ? (
            view === "timeline" ? (
              <TimelineFeed search={search} />
            ) : (
              <RecordGrid
                records={records || []}
                isLoading={isLoadingRecords}
                search={search}
                sortField="artist"
                sortOrder="asc"
                genre="all"
              />
            )
          ) : activeTab === "wishlist" ? (
            <WishlistList records={wishlistRecords || []} isLoading={isLoadingWishlist} search={search} />
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
          <AdminFab />
          <Routes>
            <Route path="/" element={<RecordList />} />
            <Route
              path="/home"
              element={
                <Suspense fallback={null}>
                  <HomePage />
                </Suspense>
              }
            />
            <Route
              path="/timeline-2"
              element={
                <Suspense fallback={null}>
                  <TimelinePage />
                </Suspense>
              }
            />
            <Route path="/top-listens" element={<TopListens />} />
            <Route path="/listen/:uid" element={<ListenRedirect />} />
            <Route path="/:artist/:album" element={<RecordDetail />} />
            <Route
              path="/testing"
              element={
                <AdminGate>
                  <Testing />
                </AdminGate>
              }
            />
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
