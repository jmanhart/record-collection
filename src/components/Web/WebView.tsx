import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { Plus, Minus, Maximize2, Shuffle } from "lucide-react";
import { useRecords } from "../../hooks/useRecords";
import { useCollectionGraph } from "../../hooks/useCollectionGraph";
import { ViewNav } from "../ViewNav/ViewNav";
import { slugify } from "../../utils/slugify";
import styles from "./WebView.module.css";

cytoscape.use(fcose);

// Published to :root while mounted so the fixed ViewNav tints light over the
// dark canvas — same mechanism the timeline/stats heroes use.
const HERO_VARS: Record<string, string> = {
  "--hero-text": "#f5f5f5",
  "--hero-line": "rgba(245, 245, 245, 0.28)",
  "--hero-fill": "rgba(245, 245, 245, 0.14)",
};

// Compound layout: pack genre zones, tile each artist's albums inside it.
const LAYOUT = {
  name: "fcose",
  quality: "default",
  animate: true,
  animationDuration: 800,
  randomize: true,
  packComponents: true,
  nodeRepulsion: 4500,
  idealEdgeLength: 50,
  gravity: 0.25,
  gravityCompound: 1.1,
  gravityRangeCompound: 1.5,
  nodeSeparation: 70,
  tile: true,
  tilingPaddingVertical: 8,
  tilingPaddingHorizontal: 8,
} as const;

const STYLESHEET: cytoscape.StylesheetJson = [
  {
    selector: "node",
    style: { "font-family": "inherit", "min-zoomed-font-size": 7 },
  },
  // Genre zones — translucent colored regions, labeled at the top.
  {
    selector: "node[kind='genre']",
    style: {
      shape: "round-rectangle",
      "background-color": "data(color)",
      "background-opacity": 0.07,
      "border-color": "data(color)",
      "border-opacity": 0.5,
      "border-width": 1.5,
      padding: "18px",
      label: "data(label)",
      color: "#f0f0f2",
      "font-size": 15,
      "font-weight": 700,
      "text-valign": "top",
      "text-halign": "center",
      "text-margin-y": 2,
      "text-outline-width": 3,
      "text-outline-color": "#14121f",
      "z-index": 1,
    },
  },
  // Artist zones — invisible containers that just group the albums; label on
  // zoom/hover so the field stays legible.
  {
    selector: "node[kind='artist']",
    style: {
      "background-opacity": 0,
      "border-width": 0,
      padding: "5px",
      label: "data(label)",
      color: "rgba(240, 240, 242, 0.92)",
      "font-size": 8,
      "text-valign": "top",
      "text-halign": "center",
      "text-outline-width": 2,
      "text-outline-color": "#14121f",
      "text-opacity": 0,
      "z-index": 2,
    },
  },
  // Albums — colored dots tinted to their cover's dominant color.
  {
    selector: "node[kind='album']",
    style: {
      "background-color": "data(color)",
      width: 15,
      height: 15,
      label: "data(label)",
      color: "rgba(240, 240, 242, 0.88)",
      "font-size": 6,
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 2,
      "text-max-width": "70px",
      "text-wrap": "ellipsis",
      "text-outline-width": 1.5,
      "text-outline-color": "#14121f",
      "text-opacity": 0,
      "z-index": 3,
    },
  },
  {
    selector: "node[kind='album']:selected",
    style: { "border-width": 2, "border-color": "#ffffff", "text-opacity": 1 },
  },
  { selector: ".dim", style: { opacity: 0.1 } },
  { selector: ".focus", style: { opacity: 1, "text-opacity": 1, "z-index": 40 } },
];

export default function WebView() {
  const navigate = useNavigate();
  const { records, isLoading } = useRecords();
  const graph = useCollectionGraph(records);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(HERO_VARS)) root.style.setProperty(k, v);
    document.body.classList.add("nav-over-hero");
    return () => {
      for (const k of Object.keys(HERO_VARS)) root.style.removeProperty(k);
      document.body.classList.remove("nav-over-hero");
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || graph.elements.length === 0) return;

    const cy = cytoscape({
      container,
      elements: graph.elements,
      style: STYLESHEET,
      layout: LAYOUT,
      minZoom: 0.1,
      maxZoom: 4,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: false,
    });
    cyRef.current = cy;
    cy.ready(() => setReady(true));

    // Progressive labels: artist names mid-zoom, album titles when close in.
    const applyLabelZoom = () => {
      const z = cy.zoom();
      cy.batch(() => {
        cy.nodes("[kind='artist']").style("text-opacity", z > 1.3 ? 1 : 0);
        cy.nodes("[kind='album']").style("text-opacity", z > 2.4 ? 1 : 0);
      });
    };
    cy.on("zoom", applyLabelZoom);

    // Hover: light up a node's whole lineage (zone + artist + albums), dim rest.
    cy.on("mouseover", "node", (event) => {
      const node = event.target;
      const family = node
        .ancestors()
        .union(node)
        .union(node.descendants());
      cy.elements().addClass("dim");
      family.removeClass("dim").addClass("focus");
    });
    cy.on("mouseout", "node", () => {
      cy.elements().removeClass("dim focus");
    });

    // Click an album → open its detail page.
    cy.on("tap", "node[kind='album']", (event) => {
      const data = event.target.data();
      navigate(`/${slugify(data.artist)}/${slugify(data.title)}`);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph.elements, navigate]);

  const zoomBy = (factor: number) => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({
      level: cy.zoom() * factor,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  };
  const fit = () =>
    cyRef.current?.animate({
      fit: { eles: cyRef.current.elements(), padding: 50 },
      duration: 400,
    });
  const relayout = () => cyRef.current?.layout(LAYOUT).run();

  return (
    <div className={styles.page}>
      <ViewNav />

      <div ref={containerRef} className={styles.canvas} />

      {(isLoading || !ready) && (
        <div className={styles.status}>Weaving the collection…</div>
      )}

      <div className={styles.topBar}>
        <div className={styles.meta}>
          <span className={styles.metaValue}>{graph.artistCount}</span>
          <span className={styles.metaLabel}>artists</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaValue}>{graph.albumCount}</span>
          <span className={styles.metaLabel}>albums</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaValue}>{graph.genreCount}</span>
          <span className={styles.metaLabel}>zones</span>
        </div>
      </div>

      <div className={styles.legend}>
        {graph.genreLegend.map((genre) => (
          <span key={genre.name} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: genre.color }}
            />
            {genre.name}
          </span>
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrl} onClick={() => zoomBy(1.3)} aria-label="Zoom in">
          <Plus size={18} />
        </button>
        <button className={styles.ctrl} onClick={() => zoomBy(1 / 1.3)} aria-label="Zoom out">
          <Minus size={18} />
        </button>
        <button className={styles.ctrl} onClick={fit} aria-label="Fit to view">
          <Maximize2 size={16} />
        </button>
        <button className={styles.ctrl} onClick={relayout} aria-label="Re-layout">
          <Shuffle size={16} />
        </button>
      </div>
    </div>
  );
}
