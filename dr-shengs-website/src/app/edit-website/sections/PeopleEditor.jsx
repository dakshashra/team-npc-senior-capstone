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

const COL = "people";

const emptyPerson = {
  name: "",
  position: "",
  image_url: "",
  education: "",
  area: "",
};

export function PeopleEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: "", error: false });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyPerson);
  const [adding, setAdding] = useState(emptyPerson);

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
            name: String(x.name ?? ""),
            position: String(x.position ?? ""),
            image_url: String(x.image_url ?? ""),
            education: String(x.education ?? ""),
            area: String(x.area ?? ""),
          };
        }),
      );
    } catch (e) {
      console.error(e);
      setStatus({ text: "Failed to load people.", error: true });
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
    try {
      await addDoc(collection(db, COL), {
        name: adding.name.trim(),
        position: adding.position.trim(),
        image_url: adding.image_url.trim(),
        education: adding.education.trim(),
        area: adding.area.trim(),
      });
      setAdding(emptyPerson);
      setStatus({ text: "Person added.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not add person.", error: true });
    }
  }

  async function handleSave(id) {
    try {
      await updateDoc(doc(db, COL, id), {
        name: draft.name.trim(),
        position: draft.position.trim(),
        image_url: draft.image_url.trim(),
        education: draft.education.trim(),
        area: draft.area.trim(),
      });
      setEditingId(null);
      setStatus({ text: "Person updated.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not update person.", error: true });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this person?")) return;
    try {
      await deleteDoc(doc(db, COL, id));
      setStatus({ text: "Person removed.", error: false });
      await load();
    } catch (err) {
      console.error(err);
      setStatus({ text: "Could not delete person.", error: true });
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      position: item.position,
      image_url: item.image_url,
      education: item.education,
      area: item.area,
    });
  }

  const fields = [
    { key: "name", label: "Name" },
    { key: "position", label: "Position" },
    { key: "image_url", label: "Image URL" },
    { key: "education", label: "Education" },
    { key: "area", label: "Area" },
  ];

  return (
    <Panel
      title="People"
      //subtitle="Collection «people»."
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
                  {fields.map(({ key, label }) => (
                    <div key={key}>
                      <FieldLabel>{label}</FieldLabel>
                      <TextInput
                        value={draft[key]}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
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
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-zinc-400">{item.position}</p>
                  <p className="mt-2 truncate text-xs text-zinc-500">
                    {item.image_url}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{item.education}</p>
                  <p className="text-sm text-zinc-400">{item.area}</p>
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
        <p className="mb-3 text-sm font-medium text-zinc-300">Add person</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(({ key, label }) => (
            <div key={key} className={key === "education" ? "sm:col-span-2" : ""}>
              <FieldLabel>{label}</FieldLabel>
              <TextInput
                value={adding[key]}
                onChange={(e) =>
                  setAdding((a) => ({ ...a, [key]: e.target.value }))
                }
                placeholder={label}
              />
            </div>
          ))}
        </div>
        <Btn type="submit" className="mt-3">
          Add Person
        </Btn>
      </form>

      <StatusLine message={status.text} error={status.error} />
    </Panel>
  );
}
