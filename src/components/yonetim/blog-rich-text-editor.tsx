"use client";

import type { ReactNode } from "react";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const TEXT_COLORS = [
  { label: "Siyah", value: "#0f172a" },
  { label: "Koyu gri", value: "#334155" },
  { label: "Yeşil", value: "#059669" },
  { label: "Kırmızı", value: "#dc2626" },
  { label: "Mavi", value: "#2563eb" },
  { label: "Turuncu", value: "#ea580c" },
] as const;

type BlogRichTextEditorProps = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
};

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition",
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
      )}
    >
      {children}
    </button>
  );
}

export function BlogRichTextEditor({
  name,
  defaultValue,
  placeholder = "Blog içeriğinizi yazın…",
}: BlogRichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: defaultValue?.trim() || "",
    editorProps: {
      attributes: {
        class:
          "blog-editor-content min-h-[280px] max-w-none px-4 py-3 text-base leading-relaxed text-slate-800 focus:outline-none sm:min-h-[320px]",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = currentEditor.getHTML();
      }
    },
  });

  useEffect(() => {
    if (!editor || !hiddenInputRef.current) return;
    hiddenInputRef.current.value = editor.getHTML();
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        Editör yükleniyor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue="" />

      <div className="flex flex-wrap gap-1.5 border-b border-slate-200/80 bg-slate-50/90 p-2 sm:p-3">
        <ToolbarButton
          title="Kalın"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="İtalik"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>

        <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline" aria-hidden />

        <ToolbarButton
          title="Başlık H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Başlık H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>

        <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline" aria-hidden />

        <ToolbarButton
          title="Madde işaretli liste"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Liste
        </ToolbarButton>
        <ToolbarButton
          title="Numaralı liste"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Liste
        </ToolbarButton>

        <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline" aria-hidden />

        <ToolbarButton
          title="Sola hizala"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ←
        </ToolbarButton>
        <ToolbarButton
          title="Ortala"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ↔
        </ToolbarButton>
        <ToolbarButton
          title="Sağa hizala"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          →
        </ToolbarButton>

        <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline" aria-hidden />

        <div className="flex flex-wrap items-center gap-1">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              onClick={() => editor.chain().focus().setColor(color.value).run()}
              className="size-7 rounded-full border border-slate-200 transition hover:scale-105"
              style={{ backgroundColor: color.value }}
            />
          ))}
          <ToolbarButton
            title="Rengi temizle"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            ✕
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
