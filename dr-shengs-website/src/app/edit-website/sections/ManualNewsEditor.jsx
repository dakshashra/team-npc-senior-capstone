"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { Btn, FieldLabel, Panel, StatusLine, TextArea, TextInput } from "../editorUi";

const COL = "manual-news";
const EMPTY = { title: "", description: "", year: "", link: "" };

export function ManualNewsEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: "", error: false });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [adding, setAdding] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus({ text: "", error: false });
    try {
      const snap = await getDocs(collection(db, COL));
      const docs = snap.docs.map((d) => ({
        id: d.id,
        title: String(d.data().title ?? ""),
        description: String(d.data().description ?? ""),
        year: String(d.data().year ?? ""),
        link: String(d.data().link ?? ""),
      }));
      // Sort descending by year
      docs.sort((a, b) => b.year.localeCompare(a.year));
      setItems(docs);
    } catch (e) {
      console.error(e);
      setStatus({ text: "Failed to load news.", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!adding.title.trim()) {
      setStatus({ text: "Title is required.", error: true });
      return;
    }
    if (!adding.year.trim()) {
      setStatus({ text: "Year is required.", error: true });
      return;
    }
    try {
      await addDoc(collection(db, COL), {
        title: adding.title.trim(),
        description: adding.description.trim(),
        year: adding.year.trim(),
        link: adding.link.trim(),
      });
      setAdding(EMPTY);
      setStatus({ text: "News item added.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not add news item.", error: true });
    }
  }

  async function handleSave(id) {
    if (!draft.title.trim()) {
      setStatus({ text: "Title is required.", error: true });
      return;
    }
    if (!draft.year.trim()) {
      setStatus({ text: "Year is required.", error: true });
      return;
    }
    try {
      await updateDoc(doc(db, COL, id), {
        title: draft.title.trim(),
        description: draft.description.trim(),
        year: draft.year.trim(),
        link: draft.link.trim(),
      });
      setEditingId(null);
      setStatus({ text: "News item updated.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not update news item.", error: true });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this news item?")) return;
    try {
      await deleteDoc(doc(db, COL, id));
      setStatus({ text: "News item removed.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not delete news item.", error: true });
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({ title: item.title, description: item.description, year: item.year, link: item.link });
  }

  return (
    <Panel
      title="News"
      subtitle="Manage manual-news entries displayed on the News page."
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
            <p className="text-sm text-zinc-400">No news items yet. Add one below.</p>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
            >
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <TextInput
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="News title"
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
                    <FieldLabel>Year</FieldLabel>
                    <TextInput
                      value={draft.year}
                      onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
                      placeholder="e.g. 2025"
                    />
                  </div>
                  <div>
                    <FieldLabel>Link (optional)</FieldLabel>
                    <TextInput
                      value={draft.link}
                      onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
                      placeholder="https://..."
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
                  <p className="font-semibold text-white">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">Year: {item.year}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-blue-400 hover:underline truncate"
                    >
                      {item.link}
                    </a>
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
        <p className="mb-3 text-sm font-medium text-zinc-300">Add news item</p>
        <div className="grid gap-3">
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput
              value={adding.title}
              onChange={(e) => setAdding((a) => ({ ...a, title: e.target.value }))}
              placeholder="News title"
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
            <FieldLabel>Year</FieldLabel>
            <TextInput
              value={adding.year}
              onChange={(e) => setAdding((a) => ({ ...a, year: e.target.value }))}
              placeholder="e.g. 2025"
            />
          </div>
          <div>
            <FieldLabel>Link (optional)</FieldLabel>
            <TextInput
              value={adding.link}
              onChange={(e) => setAdding((a) => ({ ...a, link: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
        <Btn type="submit" className="mt-3">
          Add news item
        </Btn>
      </form>

      <StatusLine message={status.text} error={status.error} />
    </Panel>
  );
}
