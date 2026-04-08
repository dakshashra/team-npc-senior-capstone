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

const COL = "publications";

const emptyPub = {
  title: "",
  authors: "",
  abstract_text: "",
  source: "",
  link: "",
};

export function PublicationsEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: "", error: false });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyPub);
  const [adding, setAdding] = useState(emptyPub);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus({ text: "", error: false });
    try {
      const snap = await getDocs(collection(db, COL));
      setItems(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            title: String(x.title ?? ""),
            authors: String(x.authors ?? ""),
            abstract_text: String(x.abstract_text ?? ""),
            source: String(x.source ?? ""),
            link: String(x.link ?? ""),
          };
        }),
      );
    } catch (e) {
      console.error(e);
      setStatus({ text: "Failed to load publications.", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!adding.title.trim()) {
      setStatus({ text: "Title is required.", error: true });
      return;
    }
    try {
      await addDoc(collection(db, COL), {
        title: adding.title.trim(),
        authors: adding.authors.trim(),
        abstract_text: adding.abstract_text.trim(),
        source: adding.source.trim(),
        link: adding.link.trim(),
      });
      setAdding(emptyPub);
      setStatus({ text: "Publication added.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not add publication.", error: true });
    }
  }

  async function handleSave(id) {
    try {
      await updateDoc(doc(db, COL, id), {
        title: draft.title.trim(),
        authors: draft.authors.trim(),
        abstract_text: draft.abstract_text.trim(),
        source: draft.source.trim(),
        link: draft.link.trim(),
      });
      setEditingId(null);
      setStatus({ text: "Publication updated.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not update publication.", error: true });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this publication?")) return;
    try {
      await deleteDoc(doc(db, COL, id));
      setStatus({ text: "Publication removed.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not delete publication.", error: true });
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      authors: item.authors,
      abstract_text: item.abstract_text,
      source: item.source,
      link: item.link,
    });
  }

  return (
    <Panel
      title="Publications"
      //subtitle="Collection «publications». Abstract uses a large editor."
      actions={
        <Btn variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Btn>
      }
    >
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <ul className="space-y-6">
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
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, title: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel>Authors</FieldLabel>
                    <TextInput
                      value={draft.authors}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, authors: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel>Abstract</FieldLabel>
                    <TextArea
                      value={draft.abstract_text}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          abstract_text: e.target.value,
                        }))
                      }
                      rows={18}
                      className="min-h-[22rem] font-mono text-[13px] leading-relaxed"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Source</FieldLabel>
                      <TextInput
                        value={draft.source}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, source: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel>Link</FieldLabel>
                      <TextInput
                        value={draft.link}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, link: e.target.value }))
                        }
                      />
                    </div>
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
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{item.authors}</p>
                  <p className="mt-3 line-clamp-4 text-sm text-zinc-500">
                    {item.abstract_text}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {item.source}
                    {item.link ? (
                      <span className="ml-2 truncate text-[#CC0000]/80">
                        {item.link}
                      </span>
                    ) : null}
                  </p>
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
        <p className="mb-3 text-sm font-medium text-zinc-300">
          Add publication
        </p>
        <div className="space-y-3">
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput
              value={adding.title}
              onChange={(e) =>
                setAdding((a) => ({ ...a, title: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>Authors</FieldLabel>
            <TextInput
              value={adding.authors}
              onChange={(e) =>
                setAdding((a) => ({ ...a, authors: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>Abstract</FieldLabel>
            <TextArea
              value={adding.abstract_text}
              onChange={(e) =>
                setAdding((a) => ({ ...a, abstract_text: e.target.value }))
              }
              rows={18}
              className="min-h-[22rem] font-mono text-[13px] leading-relaxed"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Source</FieldLabel>
              <TextInput
                value={adding.source}
                onChange={(e) =>
                  setAdding((a) => ({ ...a, source: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Link</FieldLabel>
              <TextInput
                value={adding.link}
                onChange={(e) =>
                  setAdding((a) => ({ ...a, link: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
        <Btn type="submit" className="mt-3">
          Add Publication
        </Btn>
      </form>

      <StatusLine message={status.text} error={status.error} />
    </Panel>
  );
}
