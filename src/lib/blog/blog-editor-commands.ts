import type { Editor } from "@tiptap/react";

/**
 * Seçili metnin yalnızca kendi bloğuna başlık uygulanır.
 * Aynı paragraf/hardBreak satırındaki seçilmemiş metin etkilenmez.
 */
export function applyHeadingToSelection(editor: Editor, level: 2 | 3) {
  const { state } = editor;
  const { from, to, empty } = state.selection;

  if (empty) {
    editor.chain().focus().toggleHeading({ level }).run();
    return;
  }

  const $from = state.doc.resolve(from);
  const $to = state.doc.resolve(to);

  if (!$from.sameParent($to) || !$from.parent.isTextblock) {
    editor.chain().focus().toggleHeading({ level }).run();
    return;
  }

  const blockStart = $from.start();
  const blockEnd = $from.end();
  const needsSplitStart = from > blockStart;
  const needsSplitEnd = to < blockEnd;

  if (!needsSplitStart && !needsSplitEnd) {
    editor.chain().focus().toggleHeading({ level }).run();
    return;
  }

  editor
    .chain()
    .focus()
    .command(({ tr, dispatch }) => {
      if (!dispatch) return true;

      let splitTo = to;

      if (needsSplitStart) {
        tr.split(from);
        splitTo = tr.mapping.map(to);
      }

      if (needsSplitEnd) {
        tr.split(splitTo);
      }

      dispatch(tr);
      return true;
    })
    .toggleHeading({ level })
    .run();
}
