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
import { Btn, FieldLabel, Panel, StatusLine, TextInput } from "../editorUi";

const COL = "awards";

export function AwardsEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: "", error: false });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ category: "", description: "" });
  const [adding, setAdding] = useState({ category: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setStatus({ text: "", error: false });
    try {
      const snap = await getDocs(collection(db, COL));
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          category: String(d.data().category ?? ""),
          description: String(d.data().description ?? ""),
        })),
      );
    } catch (e) {
      console.error(e);
      setStatus({ text: "Failed to load awards.", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!adding.category.trim()) {
      setStatus({ text: "Category is required.", error: true });
      return;
    }
    try {
      await addDoc(collection(db, COL), {
        category: adding.category.trim(),
        description: adding.description.trim(),
      });
      setAdding({ category: "", description: "" });
      setStatus({ text: "Award added.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not add award.", error: true });
    }
  }

  async function handleSave(id) {
    try {
      await updateDoc(doc(db, COL, id), {
        category: draft.category.trim(),
        description: draft.description.trim(),
      });
      setEditingId(null);
      setStatus({ text: "Award updated.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not update award.", error: true });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this award?")) return;
    try {
      await deleteDoc(doc(db, COL, id));
      setStatus({ text: "Award removed.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not delete award.", error: true });
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({
      category: item.category,
      description: item.description,
    });
  }

  return (
    <Panel
      title="Awards"
      //subtitle="Collection «awards» — category & description."
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
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
            >
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <TextInput
                      value={draft.category}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, category: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <TextInput
                      value={draft.description}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Btn onClick={() => handleSave(item.id)}>Save</Btn>
                    <Btn
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-white">{item.category}</p>
                  <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
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

      <form
        onSubmit={handleAdd}
        className="mt-8 border-t border-zinc-800 pt-6"
      >
        <p className="mb-3 text-sm font-medium text-zinc-300">Add award</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Category</FieldLabel>
            <TextInput
              value={adding.category}
              onChange={(e) =>
                setAdding((a) => ({ ...a, category: e.target.value }))
              }
              placeholder="Category"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Description</FieldLabel>
            <TextInput
              value={adding.description}
              onChange={(e) =>
                setAdding((a) => ({ ...a, description: e.target.value }))
              }
              placeholder="Description"
            />
          </div>
        </div>
        <Btn type="submit" className="mt-3">
          Add award
        </Btn>
      </form>

      <StatusLine message={status.text} error={status.error} />
    </Panel>
  );
}
