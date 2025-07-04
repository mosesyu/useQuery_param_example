import React, { useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

// Simulate an async fetch with a param
const fetchData = async (id) => {
  console.log("Fetching data for id:", id);
  await new Promise((r) => setTimeout(r, 2000));
  return { id, value: Math.floor(Math.random() * 1000) };
};

function DataComponent({ id, enabled }) {
  // The queryKey includes the param, so caching is per-id
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["data", id, enabled], //, enabled
    queryFn: () => fetchData(id),

    enabled: enabled,

    //staleTime: 5 * 60 * 1000,
    staleTime: 0, // This is the default.
    // staleTime: 0 kind of only makes sense if gcTime is not 0. 
    // With gcTime = 0, the cache is always cleared on unmount, so remounting always triggers a fresh fetch, regardless of staleTime.
    // With gcTime > 0, staleTime = 0 means the data is always considered stale, so it will be refetched on remount. But if staleTime > 0, it will be cached for that duration.

    gcTime: 5 * 60 * 1000, // cacheTime in v4. This is the default.
    //gcTime: 0,

    //placeholderData: { id, value: "hello placeholder" },  // keepPreviousData in v4
    // This changes the behaviour of isLoading and isFetching.
    // Without placeholderData, isLoading would be true and isFetching is true until the data is fetched. 
    // With placeholderData, is never true even for the very first load.
    // isLoading is the same as isFetching && isPending.
  });

  React.useEffect(() => {
    return () => {
      console.log(`DataComponent for id ${id} unmounted`);
    };
  }, [id]);

  if (isLoading) {
    return <div style={{ color: 'red' }}>isLoading: {String(isLoading)}, isFetching: {String(isFetching)}...{!!data ? data : "no data"}</div>;
  }
  return (
    <div>
      {isFetching && <div style={{ color: 'blue' }}>isLoading: {String(isLoading)}, isFetching: {String(isFetching)}...</div>}
      <strong>Component for id: {id}</strong>
      <div>Value: {data?.value}</div>
    </div>
  );
}

function App() {
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [idA, setIdA] = useState(1);
  const [idB, setIdB] = useState(1);
  const [idCommon, setIdCommon] = useState(1);
  const enabled = useRef(true);

  return (
    <div>
      <button onClick={() => setIdCommon((i) => i + 1)}>Change idCommon</button>
      <button onClick={() => enabled.current = !enabled.current}>
        Toggle Enabled
      </button>
      <div><b>Enabled:</b> {String(enabled.current)}</div>
      <hr />
      <div>
        <button onClick={() => setIdA((i) => i + 1)}>Change idA</button>
        <button onClick={() => setShowA((s) => !s)}>
          Toggle Component A
        </button>
        {showA && <div>
          <DataComponent id={`A${idA}`} enabled={enabled.current} />
          <DataComponent id={`${idCommon}`} enabled={enabled.current} />
          <div><b>Enabled:</b> {String(enabled.current)}</div>
        </div>}
      </div>
      <hr />
      <div>
        <button onClick={() => setIdB((i) => i + 1)}>Change idB</button>
        <button onClick={() => setShowB((s) => !s)}>
          Toggle Component B
        </button>
        {showB && <div>
          <DataComponent id={`B${idB}`} enabled={enabled.current} />
          <DataComponent id={`${idCommon}`} enabled={enabled.current} />
          <div><b>Enabled:</b> {String(enabled.current)}</div>
        </div>}
      </div>
      <hr />
      <p>
        Open the console to see when fetchData is called. Toggle components and change ids to see caching in action.<br />
        <ul>
          <li>
            When 2 DataComponents have the same id, they share cache. When ids differ, each has its own cache.
          </li>
          <li>
            Toggling enabled does not affect the cache.
          </li>
        </ul>
      </p>
    </div>
  );
}

const queryClient = new QueryClient();

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}