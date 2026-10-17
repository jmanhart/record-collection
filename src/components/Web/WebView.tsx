import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { Plus, Minus, Maximize2, Shuffle } from "lucide-react";
import { useRecords } from "../../hooks/useRecords";
import { useCollectionGraph } from "../../hooks/useCollectionGraph";
import { ViewNav } from "../ViewNav/ViewNav";
import styles from "./WebView.module.css";

cytoscape.use(fcose);

// Published to :root while mounted so the fixed ViewNav tints light over the
// dark canvas — same mechanism the timeline/stats heroes use.
const HERO_VARS: Record<string, string> = {
  "--hero-text": "#f5f5f5",
  "--hero-line": "rgba(245, 245, 245, 0.28)",
  "--hero-fill": "rgba(245, 245, 245, 0.14)",
};

const LAYOUT = {
  name: "fcose",
  quality: "default",
  animate: true,
  animationDuration: 700,
  randomize: true,
  idealEdgeLength: 70,
  nodeRepulsion: 7000,
  gravity: 0.3,
  gravityRange: 3.0,
  packComponents: true,
  nodeSeparation: 80,
} as const;

const STYLESHEET: cytoscape.StylesheetJson = [
  {
    selector: "node",
    style: {
      "background-color": "data(color)",
      width: "data(diam)",
      height: "data(diam)",
      "border-width": 0,
      label: "data(label)",
      color: "#e8e8ea",
      "font-family": "inherit",
      "text-valign": "center",
      "text-halign": "center",
      "min-zoomed-font-size": 8,
    },
  },
  {
    selector: "node[kind='genre']",
    style: {
      "font-size": 13,
      "font-weight": 700,
      "text-outline-width": 3,
      "text-outline-color": "#12101b",
      "z-index": 20,
    },
  },
  {
    selector: "node[kind='artist']",
    style: {
      "font-size": 9,
      color: "rgba(232, 232, 234, 0.85)",
      "text-outline-width": 2,
      "text-outline-color": "#12101b",
      // Artist labels only show when zoomed in; keeps the field legible.
      "text-opacity": 0,
    },
  },
  {
    selector: "edge",
    style: {
      width: 1,
      "line-color": "rgba(245, 245, 245, 0.1)",
      "curve-style": "straight",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-width": 2,
      "border-color": "#ffffff",
      "text-opacity": 1,
    },
  },
  { selector: ".dim", style: { opacity: 0.12 } },
  {
    selector: ".focus",
    style: { opacity: 1, "text-opacity": 1, "z-index": 30 },
  },
];

export default function WebView() {
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
      minZoom: 0.15,
      maxZoom: 3,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: false,
    });
    cyRef.current = cy;
    cy.ready(() => setReady(true));

    // Reveal artist labels once the user zooms past a threshold.
    const applyLabelZoom = () => {
      cy.batch(() => {
        const show = cy.zoom() > 0.9;
        cy.nodes("[kind='artist']").style("text-opacity", show ? 1 : 0);
      });
    };
    cy.on("zoom", applyLabelZoom);

    // Hover: focus a node and its neighborhood, dim the rest.
    cy.on("mouseover", "node", (event) => {
      const node = event.target;
      const neighborhood = node.closedNeighborhood();
      cy.elements().addClass("dim");
      neighborhood.removeClass("dim").addClass("focus");
    });
    cy.on("mouseout", "node", () => {
      cy.elements().removeClass("dim focus");
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph.elements]);

  const zoomBy = (factor: number) => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * factor, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };
  const fit = () => cyRef.current?.animate({ fit: { eles: cyRef.current.elements(), padding: 60 }, duration: 400 });
  const relayout = () => cyRef.current?.layout(LAYOUT).run();

  return (
    <div className={styles.page}>
      <ViewNav />

      <div ref={containerRef} className={styles.canvas} />

      {(isLoading || !ready) && <div className={styles.status}>Weaving the collection…</div>}

      <div className={styles.topBar}>
        <div className={styles.meta}>
          <span className={styles.metaValue}>{graph.artistCount}</span>
          <span className={styles.metaLabel}>artists</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaValue}>{graph.genreCount}</span>
          <span className={styles.metaLabel}>genres</span>
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
