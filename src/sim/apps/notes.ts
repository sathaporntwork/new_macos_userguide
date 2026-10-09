/** Notes (โน้ต) — เขียน/แก้โน้ต */

import { h, clear } from '../../core/dom';
import type { AppDef } from './registry';
import type { Simulator } from '../simulator';
import { uid } from '../../core/utils';

export const notesApp: AppDef = {
  id: 'notes',
  name: 'โน้ต',
  en: 'Notes',
  icon: 'notes',
  dock: true,
  w: 700,
  h: 460,

  menus: (sim) => [
    {
      title: 'ไฟล์',
      items: [
        { label: 'โน้ตใหม่', shortcut: '⌘N', onclick: () => sim.newNote() },
      ],
    },
    {
      title: 'โน้ต',
      items: [{ label: 'เลิกทำงานโน้ต', shortcut: '⌘Q', onclick: () => sim.quitApp('notes') }],
    },
  ],

  render(body, sim) {
    body.classList.add('notes');
    let activeId: string | null = sim.store.get().notes[0]?.id ?? null;

    const listEl = h('div.notes-list', { dataset: { simTarget: 'notes-list' } });
    const editorEl = h('div.notes-editor');
    const titleInput = h('input.note-title-input', {
      type: 'text',
      placeholder: 'หัวข้อ',
      dataset: { simTarget: 'note-title' },
    }) as HTMLInputElement;
    const bodyInput = h('textarea.note-body-input', {
      placeholder: 'เริ่มพิมพ์ได้เลย…',
      dataset: { simTarget: 'note-body' },
    }) as HTMLTextAreaElement;

    const unsub = sim.store.subscribe(() => {
      renderList();
      syncEditor();
    });
    body.addEventListener('simdestroy', unsub, { once: true });

    body.append(
      h(
        'div.notes-toolbar',
        h('button.notes-new', {
          dataset: { simTarget: 'notes-newbtn' },
          title: 'โน้ตใหม่ (⌘N)',
          html: '✎',
          onclick: () => sim.newNote(),
        }),
        h('span.notes-count'),
      ),
      h('div.notes-main', listEl, editorEl),
    );

    editorEl.append(titleInput, bodyInput);

    titleInput.oninput = () => {
      sim.emit({ type: 'notes:edit' });
      editActive(titleInput.value, bodyInput.value);
    };
    bodyInput.oninput = () => {
      sim.emit({ type: 'notes:edit' });
      editActive(titleInput.value, bodyInput.value);
    };

    function editActive(title: string, text: string): void {
      if (!activeId) return;
      sim.store.update((s) => ({
        notes: s.notes.map((n) =>
          n.id === activeId
            ? { ...n, title: title || 'โน้ตใหม่', body: text, modified: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) }
            : n,
        ),
      }));
    }

    function syncEditor(): void {
      const note = sim.store.get().notes.find((n) => n.id === activeId);
      if (!note) {
        titleInput.value = '';
        bodyInput.value = '';
        return;
      }
      if (document.activeElement !== titleInput) titleInput.value = note.title;
      if (document.activeElement !== bodyInput) bodyInput.value = note.body;
    }

    function renderList(): void {
      clear(listEl);
      const notes = sim.store.get().notes;
      const countEl = body.querySelector<HTMLElement>('.notes-count');
      if (countEl) countEl.textContent = `${notes.length} โน้ต`;
      for (const n of notes) {
        listEl.appendChild(
          h(
            'button.note-card',
            {
              dataset: { simTarget: 'note-card', noteId: n.id },
              class: n.id === activeId ? 'active' : '',
              onclick: () => {
                activeId = n.id;
                renderList();
                syncEditor();
              },
            },
            h('div.note-card-title', { text: n.title || 'โน้ตใหม่' }),
            h('div.note-card-snip', { text: n.body.split('\n')[0]?.slice(0, 40) ?? '' }),
            h('div.note-card-date', { text: n.modified }),
          ),
        );
      }
    }

    renderList();
    syncEditor();
  },
};

/** สร้างโน้ตใหม่ (เรียกจาก simulator) */
export function createNoteInStore(sim: Simulator): string {
  const id = uid();
  sim.store.update((s) => ({
    notes: [
      {
        id,
        title: 'โน้ตใหม่',
        body: '',
        modified: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
      ...s.notes,
    ],
  }));
  return id;
}
