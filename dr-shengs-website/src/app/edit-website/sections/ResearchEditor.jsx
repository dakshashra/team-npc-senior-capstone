"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { Btn, Panel, StatusLine, TextInput } from "../editorUi";

const COL = "research";

function normalizeStrings(v) {
  if (!Array.isArray(v)) return [];
  return v.map((s) => String(s ?? ""));
}

// ── Lifted outside ResearchEditor so React never unmounts it on re-render ────
function ArrayBlock({
  docId,
  label,
  field,
  placeholderAdd,
  pack,
  newItemVal,
  onChangeItem,
  onRemoveItem,
  onNewItemChange,
  onAddItem,
}) {
  if (!pack) return null;
  const list = pack[field];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
      <p className="mb-3 text-sm font-medium text-zinc-300">{label}</p>
      <ul className="space-y-2">
        {list.map((line, i) => (
          <li
            key={`${docId}-${field}-${i}`}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <TextInput
              value={line}
              onChange={(e) => onChangeItem(docId, field, i, e.target.value)}
              className="sm:flex-1"
            />
            <Btn
              variant="danger"
              className="shrink-0"
              onClick={() => onRemoveItem(docId, field, i)}
            >
              Remove
            </Btn>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <TextInput
          value={newItemVal}
          onChange={(e) => onNewItemChange(docId, field, e.target.value)}
          placeholder={placeholderAdd}
          className="sm:flex-1"
        />
        <Btn
          variant="secondary"
          className="shrink-0"
          onClick={() => onAddItem(docId, field, newItemVal)}
        >
          Add line
        </Btn>
      </div>
    </div>
  );
}

export function ResearchEditor() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: "", error: false });
  const [local, setLocal] = useState({});
  const [newItems, setNewItems] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setStatus({ text: "", error: false });
    try {
      const snap = await getDocs(collection(db, COL));
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          interests: normalizeStrings(data.interests),
          research_fundings: normalizeStrings(data.research_fundings),
        };
      });
      setDocs(rows);
      const initLocal = {};
      const initNew = {};
      for (const r of rows) {
        initLocal[r.id] = {
          interests: [...r.interests],
          research_fundings: [...r.research_fundings],
        };
        initNew[r.id] = { interest: "", funding: "" };
      }
      setLocal(initLocal);
      setNewItems(initNew);
    } catch (e) {
      console.error(e);
      setStatus({ text: "Failed to load research.", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveAllForDoc(docId) {
    const pack = local[docId];
    if (!pack) return;
    try {
      await updateDoc(doc(db, COL, docId), {
        interests: pack.interests,
        research_fundings: pack.research_fundings,
      });
      setStatus({ text: "Research arrays saved.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not save research.", error: true });
    }
  }

  function handleChangeItem(docId, field, index, value) {
    setLocal((prev) => {
      const cur = prev[docId];
      if (!cur) return prev;
      const arr = [...cur[field]];
      arr[index] = value;
      return { ...prev, [docId]: { ...cur, [field]: arr } };
    });
  }

  function handleRemoveItem(docId, field, index) {
    setLocal((prev) => {
      const cur = prev[docId];
      if (!cur) return prev;
      return {
        ...prev,
        [docId]: { ...cur, [field]: cur[field].filter((_, i) => i !== index) },
      };
    });
  }

  function handleNewItemChange(docId, field, value) {
    const inputKey = field === "interests" ? "interest" : "funding";
    setNewItems((prev) => ({
      ...prev,
      [docId]: { ...(prev[docId] ?? { interest: "", funding: "" }), [inputKey]: value },
    }));
  }

  function handleAddItem(docId, field, raw) {
    const t = raw.trim();
    if (!t) return;
    setLocal((prev) => {
      const cur = prev[docId];
      if (!cur) return prev;
      return { ...prev, [docId]: { ...cur, [field]: [...cur[field], t] } };
    });
    const inputKey = field === "interests" ? "interest" : "funding";
    setNewItems((prev) => ({
      ...prev,
      [docId]: { ...(prev[docId] ?? { interest: "", funding: "" }), [inputKey]: "" },
    }));
  }

  return (
    <Panel
      title="Research"
      actions={
        <Btn variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Btn>
      }
    >
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No documents in «research». Create at least one document in the
          Firebase console (with optional{" "}
          <code className="rounded bg-zinc-800 px-1">interests</code> and{" "}
          <code className="rounded bg-zinc-800 px-1">research_fundings</code>{" "}
          arrays), then refresh.
        </p>
      ) : (
        <div className="space-y-8">
          {docs.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-950/20 p-5"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <ArrayBlock
                  docId={row.id}
                  field="interests"
                  label="Interests"
                  placeholderAdd="New interest…"
                  pack={local[row.id]}
                  newItemVal={newItems[row.id]?.interest ?? ""}
                  onChangeItem={handleChangeItem}
                  onRemoveItem={handleRemoveItem}
                  onNewItemChange={handleNewItemChange}
                  onAddItem={handleAddItem}
                />
                <ArrayBlock
                  docId={row.id}
                  field="research_fundings"
                  label="Research fundings"
                  placeholderAdd="New funding line…"
                  pack={local[row.id]}
                  newItemVal={newItems[row.id]?.funding ?? ""}
                  onChangeItem={handleChangeItem}
                  onRemoveItem={handleRemoveItem}
                  onNewItemChange={handleNewItemChange}
                  onAddItem={handleAddItem}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Btn onClick={() => saveAllForDoc(row.id)}>Save Research Fields</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <StatusLine message={status.text} error={status.error} />
    </Panel>
  );
}
