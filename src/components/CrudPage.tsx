import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button, Card, PageHeader, Table } from "@/components/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type CrudField<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: readonly string[];
  required?: boolean;
};

export type CrudColumn<T> = {
  key: keyof T & string;
  label: string;
  render?: (record: T) => ReactNode;
  mono?: boolean;
};

type CrudPageProps<T extends { id: string }> = {
  title: string;
  subtitle: string;
  records: T[];
  fields: readonly CrudField<T>[];
  columns: readonly CrudColumn<T>[];
  onCreate: (record: Omit<T, "id">) => void;
  onUpdate: (id: string, changes: Partial<Omit<T, "id">>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
};

export function CrudPage<T extends { id: string }>({
  title,
  subtitle,
  records,
  fields,
  columns,
  onCreate,
  onUpdate,
  onDelete,
  emptyMessage = "No records yet.",
}: CrudPageProps<T>) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const visibleRecords = records.filter((record) =>
    fields.some((field) =>
      String(record[field.key] ?? "")
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
    ),
  );

  const openCreate = () => {
    setEditing(null);
    setDraft(Object.fromEntries(fields.map((field) => [field.key, ""])));
    setDialogOpen(true);
  };

  const openEdit = (record: T) => {
    setEditing(record);
    setDraft(
      Object.fromEntries(fields.map((field) => [field.key, String(record[field.key] ?? "")])),
    );
    setDialogOpen(true);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.type === "number" ? Number(draft[field.key] ?? 0) : (draft[field.key] ?? "").trim(),
      ]),
    ) as Omit<T, "id">;

    if (editing) onUpdate(editing.id, values);
    else onCreate(values);
    setDialogOpen(false);
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${subtitle} · ${records.length} records`}
        actions={
          <Button onClick={openCreate} type="button">
            <Plus size={16} /> Add {title.toLocaleLowerCase().replace(/s$/, "")}
          </Button>
        }
      />

      <div className="mb-4 flex max-w-sm items-center gap-2 rounded-md border border-input px-3">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <Input
          aria-label={`Search ${title.toLocaleLowerCase()}`}
          className="border-0 px-0 shadow-none focus-visible:ring-0"
          placeholder={`Search ${title.toLocaleLowerCase()}...`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {visibleRecords.length === 0 ? (
        <Card className="text-sm text-muted-foreground">
          {records.length === 0 ? emptyMessage : "No matching records."}
        </Card>
      ) : (
        <Table head={[...columns.map((column) => column.label), "Actions"]}>
          {visibleRecords.map((record) => (
            <tr key={record.id} className="border-b border-border/60 last:border-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-5 py-4 align-middle ${column.mono ? "font-mono" : ""}`}
                >
                  {column.render ? column.render(record) : String(record[column.key] ?? "—")}
                </td>
              ))}
              <td className="px-5 py-4 text-right">
                {confirmDelete === record.id ? (
                  <span className="inline-flex items-center gap-1">
                    <Button
                      aria-label="Confirm delete"
                      className="px-2 py-1"
                      onClick={() => {
                        onDelete(record.id);
                        setConfirmDelete(null);
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Check size={15} />
                    </Button>
                    <Button
                      aria-label="Cancel delete"
                      className="px-2 py-1"
                      onClick={() => setConfirmDelete(null)}
                      type="button"
                      variant="ghost"
                    >
                      <X size={15} />
                    </Button>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Button
                      aria-label={`Edit ${record.id}`}
                      className="px-2 py-1"
                      onClick={() => openEdit(record)}
                      title="Edit"
                      type="button"
                      variant="ghost"
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      aria-label={`Delete ${record.id}`}
                      className="px-2 py-1 text-danger"
                      onClick={() => setConfirmDelete(record.id)}
                      title="Delete"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
            <DialogDescription>
              Changes are saved in this browser and remain after refresh.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {fields.map((field) => (
                <label key={field.key} className="block space-y-1.5 text-sm">
                  <span className="font-medium">{field.label}</span>
                  {field.type === "select" ? (
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                      required={field.required}
                      value={draft[field.key] ?? ""}
                    >
                      <option value="">Select {field.label.toLocaleLowerCase()}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      required={field.required}
                      type={field.type ?? "text"}
                      value={draft[field.key] ?? ""}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            <DialogFooter className="shrink-0 border-t border-border pt-4">
              <Button type="button" variant="glass" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
