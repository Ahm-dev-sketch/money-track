"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Icon } from "@/components/ui/Icon";
import { addCategory, updateCategory } from "@/lib/db/repository";
import { CATEGORY_COLOR_CHOICES, CATEGORY_ICON_CHOICES, categoryTone } from "@/components/lib/constants";
import type { Category } from "@/types";

type CategoryType = "expense" | "income";

interface CategoryFormSheetProps {
  open: boolean;
  onClose: () => void;
  /** null = kategori baru. */
  category: Category | null;
  /** Tipe awal saat menambah kategori. */
  defaultType?: CategoryType;
  /** Dipanggil dengan id kategori setelah tersimpan. */
  onSaved?: (id: string) => void;
  subtitle?: string;
}

const TYPE_OPTIONS = [
  { value: "expense" as CategoryType, label: "Pengeluaran" },
  { value: "income" as CategoryType, label: "Pemasukan" },
];

/** Form kategori (nama, tipe, ikon, warna) untuk aksi tambah maupun ubah. */
export function CategoryFormSheet({
  open,
  onClose,
  category,
  defaultType = "expense",
  onSaved,
  subtitle = "Kategori membantu merapikan catatan pengeluaran dan pemasukan.",
}: CategoryFormSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={category ? "Ubah kategori" : "Kategori baru"} subtitle={subtitle}>
      {open && (
        <CategoryFormContent
          key={category?.id ?? "new"}
          category={category}
          defaultType={defaultType}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </BottomSheet>
  );
}

function CategoryFormContent({
  category,
  defaultType,
  onClose,
  onSaved,
}: {
  category: Category | null;
  defaultType: CategoryType;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<CategoryType>(category?.type ?? defaultType);
  const [icon, setIcon] = useState<string>(category?.icon ?? CATEGORY_ICON_CHOICES[0]);
  const initialColor = category ? categoryTone(category) : CATEGORY_COLOR_CHOICES[0];
  const [color, setColor] = useState<string>(initialColor);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Nama kategori wajib diisi.");
    setSaving(true);
    setError(null);
    try {
      if (category) {
        await updateCategory(category.id, { name: trimmed, icon, color, type });
        onSaved?.(category.id);
      } else {
        const id = await addCategory({ name: trimmed, icon, color, type });
        onSaved?.(id);
      }
      onClose();
    } catch {
      setError("Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Bisa berada di dalam <form> pencatat transaksi (portal React): jangan bubbling.
        e.stopPropagation();
        void submit();
      }}
      className="space-y-4 pt-1"
    >
      <div className="flex items-center gap-3.5 rounded-[20px] border border-line/80 bg-surface-2/60 p-3.5">
        <span className="grid h-11 w-11 place-items-center rounded-[14px]" style={{ background: `${color}22`, color }}>
          <Icon name={icon} size={20} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-text">{name.trim() || "Nama kategori"}</p>
          <p className="text-[12px] text-text-muted">{type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Nama</span>
        <input
          type="text"
          value={name}
          maxLength={28}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Kopi & Camilan"
          autoFocus
          className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text placeholder:text-text-muted/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <div>
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Tipe</span>
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
          layoutId={`category-type-${category?.id ?? "new"}`}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Ikon</span>
        <div className="grid grid-cols-8 gap-1.5">
          {CATEGORY_ICON_CHOICES.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              aria-pressed={icon === ic}
              aria-label={ic}
              className="grid aspect-square place-items-center rounded-lg border transition-colors"
              style={{
                borderColor: icon === ic ? `${color}80` : "var(--line)",
                background: icon === ic ? `${color}16` : "transparent",
                color: icon === ic ? color : "var(--text-muted)",
              }}
            >
              <Icon name={ic} size={16} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Warna</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLOR_CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              aria-label={`Warna ${c}`}
              className="grid h-8 w-8 place-items-center rounded-full transition-transform active:scale-90"
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${c}` : undefined }}
            >
              {color === c && <Check size={14} strokeWidth={2.5} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {category?.isSystem && (
        <p className="rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-[12px] text-text-muted">
          Kategori bawaan tidak bisa dihapus, tapi nama, ikon, dan warnanya boleh diubah.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-expense/25 bg-expense/10 px-3 py-2 text-[12.5px] font-medium text-expense">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={saving}>
        {saving ? "Menyimpan…" : category ? "Simpan perubahan" : "Tambah kategori"}
      </Button>
    </form>
  );
}
