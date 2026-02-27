import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => kioskService.getAll(), []);
 */
export function useApi(fetchFn, deps = [], immediate = true) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
}

/**
 * Mutation hook for POST/PATCH/DELETE actions.
 * Usage:
 *   const { mutate, loading, error } = useMutation(kioskService.enable);
 */
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutateFn(...args);
      return { success: true, data: result };
    } catch (err) {
      const msg = err.message || "Action failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [mutateFn]);

  return { mutate, loading, error };
}
