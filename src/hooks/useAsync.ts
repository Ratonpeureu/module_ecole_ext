import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "../utils/errors";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], enabled = true) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: enabled, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef.
    current().
    then((data) => {
      if (alive) setState({ data, loading: false, error: null });
    }).
    catch((e: unknown) => {
      if (alive) setState({ data: null, loading: false, error: errorMessage(e) });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useTick(): [number, () => void] {
  const [n, setN] = useState(0);
  const bump = useCallback(() => setN((x) => x + 1), []);
  return [n, bump];
}

export function useDebounced<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return v;
}