"use client";

import { useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { useCategories } from "@/lib/hooks/useData";
import { countTransactionsByCategory, deleteCategory } from "@/lib/db/repository";
import { categoryTone } from "@/components/lib/constants";
import { CategoryFormSheet } from "./CategoryFormSheet";
import type { Category } from "@/types";

const GROUPS = [
  { type: "expense" as const, title: "Pengeluaran" },
  { type: "income" as const, title: "Pemasukan" },
];

interface CategoryManagerSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Daftar kategori per tipe: ubah semua, hapus hanya kategori non-bawaan. */
export function CategoryManagerSheet({ open, onClose }: CategoryManagerSheetProps) {
  const categories = useCategories();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [defaultType, setDefaultType] = useState<"expense" | "income">("expense");
  const [pendingDelete, setPendingDelete] = useState<{ category: Category; count: number } | null>(null);

  const openCreate = (type: "expense" | "income") => {
    setDefaultType(type);
    setEditing("new");
  };

  const requestDelete = async (category: Category) => {
    setEditing(null);
    setPendingDelete({ category, count: await countTransactionsByCategory(category.id) });
  };

  const totalSystem = categories?.filter((c) => c.isSystem).length ?? 0;

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Kelola kategori"
        subtitle={`${categories?.length ?? 0} kategori · ${totalSystem} bawaan`}
      >
        <div className="space-y-5 pb-2 pt-1">
          {!categories ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-[16px] bg-surface-2" />
              ))}
            </div>
          ) : (
            GROUPS.map((group) => {
              const items = categories
                .filter((c) => c.type === group.type)
                .sort((a, b) => a.order - b.order);
              return (
                <section key={group.type}>
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                      {group.title}
                    </h3>
                    <span className="text-[11px] font-medium text-text-muted">{items.length}</span>
                  </div>

                  <div className="space-y-1">
                    {items.map((c) => {
                      const tone = categoryTone(c);
                      return (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 rounded-[16px] border border-line/70 bg-surface px-2.5 py-2"
                        >
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px]"
                            style={{ background: `${tone}1E`, color: tone }}
                          >
                            <Icon name={c.icon} size={17} strokeWidth={2.2} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-text">{c.name}</span>

                          {c.isSystem ? (
                            <span
                              title="Kategori bawaan"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-muted/70"
                            >
                              <Lock size={13} strokeWidth={2} />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void requestDelete(c)}
                              aria-label={`Hapus ${c.name}`}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-muted transition-colors hover:bg-expense/10 hover:text-expense active:scale-90"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditing(c)}
                            aria-label={`Ubah ${c.name}`}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text active:scale-90"
                          >
                            <Pencil size={14} strokeWidth={2} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreate(group.type)}
                    className="mt-1.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-[16px] border border-dashed border-line text-[12.5px] font-semibold text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Plus size={14} strokeWidth={2.4} /> Tambah kategori {group.title.toLowerCase()}
                  </button>
                </section>
              );
            })
          )}
        </div>
      </BottomSheet>

      <CategoryFormSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        category={editing === "new" ? null : editing}
        defaultType={defaultType}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus "${pendingDelete?.category.name ?? ""}"?`}
        description={
          pendingDelete && pendingDelete.count > 0
            ? `${pendingDelete.count} transaksi masih memakai kategori ini. Transaksi tersebut akan menjadi tanpa kategori.`
            : "Kategori akan dihapus. Belum ada transaksi yang memakainya."
        }
        onConfirm={() => {
          if (pendingDelete) void deleteCategory(pendingDelete.category.id);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
