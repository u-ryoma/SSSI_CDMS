import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

// Loads the predicted completion of every job currently in the pipeline.
//
//   const { byJob, model, loading, reload } = usePredictions();
//   byJob["SSS/0001/26"]  ->  { predictedCompletion, atRisk, currentStage, ... }
//
// Jobs that are not in the pipeline (finished, or never logged) are simply
// missing from byJob, so look-ups should tolerate undefined.
export default function usePredictions() {
  const [jobs, setJobs] = useState([]);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/predictions/active`);
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to load predictions");
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setModel(data.model || null);
    } catch (err) {
      console.error("Failed to load predictions:", err);
      setError("Could not load predictions.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const byJob = Object.fromEntries(jobs.map((j) => [j.jobNumber, j]));
  return { jobs, byJob, model, loading, error, reload };
}
