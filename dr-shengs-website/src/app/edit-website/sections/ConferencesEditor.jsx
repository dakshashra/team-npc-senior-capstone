"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { Btn, FieldLabel, Panel, StatusLine, TextArea, TextInput } from "../editorUi";

const COL = "conferences";

/** Format a Firestore Timestamp or date string to YYYY-MM-DD for <input type="date"> */
function toInputDate(val) {
  if (!val) return "";
  const d = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
}

/** Returns true if the given YYYY-MM-DD string is today or in the future. */
function isDateValid(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosen = new Date(dateStr + "T00:00:00");
  return chosen >= today;
}

export function ConferencesEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: "", error: false });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", description: "", date: "" });
  const [adding, setAdding] = useState({ name: "", description: "", date: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setStatus({ text: "", error: false });
    try {
      const snap = await getDocs(collection(db, COL));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const all = snap.docs.map((d) => ({
        id: d.id,
        name: String(d.data().name ?? ""),
        description: String(d.data().description ?? ""),
        date: d.data().date ?? null,
      }));
      // Only show upcoming conferences in the admin list
      setItems(
        all.filter((item) => {
          if (!item.date) return true; // no date — show it
          const d = item.date?.toDate ? item.date.toDate() : new Date(item.date);
          if (isNaN(d)) return true;
          const day = new Date(d); day.setHours(0, 0, 0, 0);
          return day >= today;
        })
      );
    } catch (e) {
      console.error(e);
      setStatus({ text: "Failed to load conferences.", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!adding.name.trim()) {
      setStatus({ text: "Name is required.", error: true });
      return;
    }
    if (adding.date && !isDateValid(adding.date)) {
      setStatus({ text: "Date must be today or in the future.", error: true });
      return;
    }
    try {
      await addDoc(collection(db, COL), {
        name: adding.name.trim(),
        description: adding.description.trim(),
        date: adding.date ? Timestamp.fromDate(new Date(adding.date)) : null,
      });
      setAdding({ name: "", description: "", date: "" });
      setStatus({ text: "Conference added.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not add conference.", error: true });
    }
  }

  async function handleSave(id) {
    if (draft.date && !isDateValid(draft.date)) {
      setStatus({ text: "Date must be today or in the future.", error: true });
      return;
    }
    try {
      await updateDoc(doc(db, COL, id), {
        name: draft.name.trim(),
        description: draft.description.trim(),
        date: draft.date ? Timestamp.fromDate(new Date(draft.date)) : null,
      });
      setEditingId(null);
      setStatus({ text: "Conference updated.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not update conference.", error: true });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this conference?")) return;
    try {
      await deleteDoc(doc(db, COL, id));
      setStatus({ text: "Conference removed.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not delete conference.", error: true });
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      description: item.description,
      date: toInputDate(item.date),
    });
  }

  return (
    <Panel
      title="Conferences"
      actions={
        <Btn variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Btn>
      }
    >
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <ul className="space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-zinc-400">No conferences yet. Add one below.</p>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
            >
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Name</FieldLabel>
                    <TextInput
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Conference name"
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <TextArea
                      value={draft.description}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <FieldLabel>Date</FieldLabel>
                    <TextInput
                      type="date"
                      value={draft.date}
                      onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Btn onClick={() => handleSave(item.id)}>Save</Btn>
                    <Btn variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-white">{item.name}</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Date: {toInputDate(item.date)}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn variant="secondary" onClick={() => startEdit(item)}>
                      Edit
                    </Btn>
                    <Btn variant="danger" onClick={() => handleDelete(item.id)}>
                      Remove
                    </Btn>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mt-8 border-t border-zinc-800 pt-6">
        <p className="mb-3 text-sm font-medium text-zinc-300">Add conference</p>
        <div className="grid gap-3">
          <div>
            <FieldLabel>Name</FieldLabel>
            <TextInput
              value={adding.name}
              onChange={(e) => setAdding((a) => ({ ...a, name: e.target.value }))}
              placeholder="Conference name"
            />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <TextArea
              value={adding.description}
              onChange={(e) => setAdding((a) => ({ ...a, description: e.target.value }))}
              placeholder="Description"
            />
          </div>
          <div>
            <FieldLabel>Date</FieldLabel>
            <TextInput
              type="date"
              value={adding.date}
              onChange={(e) => setAdding((a) => ({ ...a, date: e.target.value }))}
            />
          </div>
        </div>
        <Btn type="submit" className="mt-3">
          Add conference
        </Btn>
      </form>

      <StatusLine message={status.text} error={status.error} />
    </Panel>
  );
}
