import { useEffect, useState } from "react";

const DATA_EVENT = "tradehub:data-change";

export type IdentifiedRecord = { id: string };

function isIdentifiedRecord(value: unknown): value is IdentifiedRecord {
  return (
    typeof value === "object" && value !== null && "id" in value && typeof value.id === "string"
  );
}

export function usePersistentList<T extends IdentifiedRecord>(
  collection: string,
  initialRecords: readonly T[],
) {
  const storageKey = `tradehub:${collection}:v1`;
  const [records, setRecords] = useState<T[]>(() => [...initialRecords]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const serialized = window.localStorage.getItem(storageKey);
        if (serialized === null) {
          setHydrated(true);
          return;
        }
        const parsed: unknown = JSON.parse(serialized);
        if (Array.isArray(parsed) && parsed.every(isIdentifiedRecord)) {
          setRecords(parsed as T[]);
        }
      } catch {
        setRecords([...initialRecords]);
      } finally {
        setHydrated(true);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) load();
    };
    const handleDataChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail === storageKey) load();
    };

    load();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(DATA_EVENT, handleDataChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DATA_EVENT, handleDataChange);
    };
  }, [initialRecords, storageKey]);

  const persist = (nextRecords: T[]) => {
    window.localStorage.setItem(storageKey, JSON.stringify(nextRecords));
    setRecords(nextRecords);
    window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: storageKey }));
  };

  const create = (record: Omit<T, "id">) => {
    const created = { ...record, id: crypto.randomUUID() } as T;
    persist([...records, created]);
    return created;
  };

  const update = (id: string, changes: Partial<Omit<T, "id">>) => {
    persist(
      records.map((record) => (record.id === id ? ({ ...record, ...changes } as T) : record)),
    );
  };

  const remove = (id: string) => {
    persist(records.filter((record) => record.id !== id));
  };

  return { records, hydrated, create, update, remove };
}
