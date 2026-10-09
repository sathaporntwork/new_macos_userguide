/** Terminal — จำลองคำสั่งพื้นฐานที่ใช้บ่อย (zsh) */

import { h, clear } from '../../core/dom';
import { escapeHtml } from '../../core/utils';
import { resolvePath, createFolder, createFile, removeNode, listFolder, HOME, type SimState } from '../state';
import type { AppDef } from './registry';


export const terminalApp: AppDef = {
  id: 'terminal',
  name: 'เทอร์มินัล',
  en: 'Terminal',
  icon: 'terminal',
  dock: true,
  w: 660,
  h: 420,

  menus: (sim) => [
    {
      title: 'เทอร์มินัล',
      items: [{ label: 'เลิกทำงานเทอร์มินัล', shortcut: '⌘Q', onclick: () => sim.quitApp('terminal') }],
    },
    {
      title: 'Edit',
      items: [
        { label: 'ล้างหน้าจอ', shortcut: '⌘K', onclick: () => sim.emit({ type: 'terminal:command', command: 'clear' }) },
      ],
    },
  ],

  render(body, sim) {
    body.classList.add('terminal');
    let cwd: string[] = [...HOME];
    const history: string[] = [];
    let histIdx = -1;

    const out = h('div.term-output', { dataset: { simTarget: 'terminal-output' } });
    const input = h('input.term-input', {
      dataset: { simTarget: 'terminal-input' },
      spellcheck: false,
      autocomplete: 'off',
    }) as HTMLInputElement;
    const promptEl = h('span.term-prompt');

    body.append(
      h('div.term-screen', { onclick: () => input.focus() }, out, h('div.term-line', promptEl, input)),
    );

    const prompt = () => `somchai@macbook-pro ${cwd.length ? cwd[cwd.length - 1] : '/'} %`;
    const updatePrompt = () => (promptEl.textContent = prompt());

    function print(html: string): void {
      out.appendChild(h('div.term-row', { html }));
      body.querySelector('.term-screen')?.scrollTo({ top: 99999 });
    }

    function run(raw: string): void {
      const cmd = raw.trim();
      print(`<span class="term-cmd">${escapeHtml(prompt())} ${escapeHtml(cmd)}</span>`);
      if (cmd) history.push(cmd);
      histIdx = history.length;
      sim.emit({ type: 'terminal:command', command: cmd });
      if (cmd) execute(cmd);
      updatePrompt();
      input.value = '';
    }

    function execute(cmd: string): void {
      const [name = '', ...args] = cmd.split(/\s+/);
      const arg = args.join(' ');
      switch (name) {
        case 'help':
          print(
            `<span class="term-info">คำสั่งที่ใช้ได้: ls, cd, pwd, cat, mkdir, touch, rm, echo, clear, open, whoami, date, sw_vers</span>`,
          );
          break;
        case 'pwd':
          print('/' + cwd.join('/'));
          break;
        case 'whoami':
          print('somchai');
          break;
        case 'date':
          print(new Date().toString());
          break;
        case 'sw_vers':
          print('ProductName:\t\tmacOS\nProductVersion:\t\t26.0.1\nBuildVersion:\t\t25A362');
          break;
        case 'ls': {
          const target = arg ? resolvePath(sim.store.get().fs, [...cwd, ...arg.replace(/^~.*/, HOME.join('/')).split('/')].filter(Boolean)) : resolvePath(sim.store.get().fs, cwd);
          if (!target || target.kind !== 'folder') {
            print(`ls: ${escapeHtml(arg)}: No such file or directory`);
            break;
          }
          const items = listFolder(sim.store.get().fs, arg ? [...cwd, arg] : cwd);
          if (items.length === 0) {
            print('<span class="term-dim">(ว่างเปล่า)</span>');
          } else {
            print(items.map((i) => (i.kind === 'folder' ? `<span class="term-dir">${escapeHtml(i.name)}</span>` : escapeHtml(i.name))).join('   '));
          }
          break;
        }
        case 'cd': {
          if (!arg || arg === '~') {
            cwd = [...HOME];
            break;
          }
          if (arg === '..') {
            cwd.pop();
            break;
          }
          const next = resolvePath(sim.store.get().fs, [...cwd, arg]);
          if (next && next.kind === 'folder') cwd = [...cwd, arg];
          else print(`cd: no such file or directory: ${escapeHtml(arg)}`);
          break;
        }
        case 'cat': {
          const f = resolvePath(sim.store.get().fs, [...cwd, arg]);
          if (f && f.kind === 'file') print(escapeHtml(f.content ?? '(ไฟล์ไบนารี)'));
          else print(`cat: ${escapeHtml(arg)}: No such file or directory`);
          break;
        }
        case 'mkdir':
          if (!arg) print('usage: mkdir <ชื่อโฟลเดอร์>');
          else if (createFolder(sim.store.get().fs, cwd, arg)) print(`<span class="term-info">สร้างโฟลเดอร์ ${escapeHtml(arg)} แล้ว</span>`);
          else print(`mkdir: ${escapeHtml(arg)}: File exists`);
          break;
        case 'touch':
          if (!arg) print('usage: touch <ชื่อไฟล์>');
          else if (createFile(sim.store.get().fs, cwd, arg)) print(`<span class="term-info">สร้างไฟล์ ${escapeHtml(arg)} แล้ว</span>`);
          break;
        case 'rm': {
          const target = args.filter((a) => !a.startsWith('-')).join(' ');
          const node = resolvePath(sim.store.get().fs, [...cwd, target]);
          if (!target) print('usage: rm <ชื่อไฟล์>');
          else if (node && node.kind === 'folder' && !args.includes('-r')) print(`rm: ${escapeHtml(target)}: is a directory`);
          else if (removeNode(sim.store.get().fs, cwd, target)) {
            sim.store.update((s: SimState) => ({ trash: [...s.trash, node!] }));
            print(`<span class="term-info">ย้าย ${escapeHtml(target)} ไปถังขยะแล้ว</span>`);
          } else print(`rm: ${escapeHtml(target)}: No such file or directory`);
          break;
        }
        case 'echo':
          print(escapeHtml(arg));
          break;
        case 'clear':
          clear(out);
          break;
        case 'open': {
          const apps: Record<string, string> = {
            finder: 'finder',
            safari: 'safari',
            notes: 'notes',
            'system settings': 'settings',
            'system_preferences': 'settings',
            settings: 'settings',
          };
          const appId = apps[arg.toLowerCase().replace('.app', '')];
          if (appId) {
            sim.openApp(appId);
            print(`<span class="term-info">เปิด ${escapeHtml(arg)} แล้ว</span>`);
          } else print(`open: Unable to find application named '${escapeHtml(arg)}'`);
          break;
        }
        default:
          print(`zsh: command not found: ${escapeHtml(name)} <span class="term-dim">(พิมพ์ help เพื่อดูคำสั่งที่ใช้ได้)</span>`);
      }
    }

    input.onkeydown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') run(input.value);
      else if (e.key === 'ArrowUp') {
        if (histIdx > 0) input.value = history[--histIdx] ?? '';
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (histIdx < history.length - 1) input.value = history[++histIdx] ?? '';
        else {
          histIdx = history.length;
          input.value = '';
        }
        e.preventDefault();
      }
    };

    print(`<span class="term-info">ยินดีต้อนรับสู่ zsh — macOS Tahoe 26.0.1</span>`);
    print(`<span class="term-dim">พิมพ์ 'help' เพื่อดูคำสั่งที่ใช้ได้ • ลอง 'ls' หรือ 'sw_vers' ดูก่อนได้</span>`);
    print('');
    updatePrompt();
    setTimeout(() => input.focus(), 50);
  },
};
