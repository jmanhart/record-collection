import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { endListen } from "../../services/supabase";

// Target for a dedicated NFC "stop" tag: ends whatever is currently
// playing, then heads to the home dashboard.
export function StopListenRedirect() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Ending listen...");
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    endListen()
      .then(async (ended) => {
        setStatus(ended ? "Listen ended." : "Nothing was playing.");
        await queryClient.invalidateQueries({ queryKey: ["listens"] });
        setTimeout(() => navigate("/home", { replace: true }), 1200);
      })
      .catch(() => setStatus("Couldn't end the listen."));
  }, [navigate, queryClient]);

  return <div style={{ padding: "2rem", textAlign: "center" }}>{status}</div>;
}
