# MacPath 26 🍎⌨️

เว็บสอนใช้ **macOS 26 (Tahoe)** แบบลงมือทำทีละขั้น สำหรับผู้ที่ย้ายมาจาก Windows — ตั้งแต่มือใหม่จนเป็น **Pro User** ด้วย **simulator เดสก์ท็อป macOS จำลอง** ที่ใช้งานได้จริงในเบราว์เซอร์

![Tech](https://img.shields.io/badge/TypeScript-100%25-3178c6) ![Stack](https://img.shields.io/badge/Vite-6-646cff) ![Deploy](https://img.shields.io/badge/GitHub%20Pages-ready-222)

## ✨ จุดเด่น

- **🖥️ Mac Simulator จำลองครบ** — Menu bar + Apple menu, Dock (magnification, running indicators), หน้าต่างแบบ traffic lights (ลาก/ย่อ/ขยาย/ปิด), Mission Control, Spaces หลายเดสก์ท็อป, Stage Manager, Control Center, Launchpad, Spotlight ⌘Space (ค้นหา + เครื่องคิดเลข + คลิปบอร์ด)
- **📁 แอปใช้งานได้จริง** — Finder (virtual filesystem, sidebar, icon/list view, สร้าง/เปลี่ยนชื่อ/ลบ, แท็กสีโฟลเดอร์แบบ Tahoe), System Settings (wallpaper, Light/Dark, ขนาด Dock, natural scrolling, hot corners), Notes, Safari, Terminal (ls/cd/mkdir/touch/rm/cat ฯลฯ), Activity Monitor, Mail, Photos, ปฏิทิน
- **🎯 ระบบสอนทีละขั้น (Tutor Engine)** — ทุก step ตรวจการกระทำของผู้เรียนผ่าน typed event bus แล้วเลื่อนขั้นให้เอง มี coach highlight ชี้จุด, คำใบ้, ควิซ, ภารกิจอิสระ และปุ่ม keycap สำหรับฝึกคีย์ลัดที่ชนกับปุ่ม Windows
- **🏆 ระบบจูงใจครบ** — XP, 5 ระดับ (New User → Pro User), ตราสะสม 10 ชิ้น, สนามฝึกคีย์ลัดจับคะแนน และประกาศนียบัตรเมื่อจบครบ (เก็บใน localStorage)
- **🇹🇭 เนื้อหาไทยล้วน** — 38 บทเรียนใน 7 โมดูล พร้อมกล่อง "เทียบกับ Windows" ทุกบท
- **📦 TypeScript ล้วน ไม่มี runtime framework** — bundle เพียง ~60 KB (gzip) โหลดไวทันที

## 🚀 รันในเครื่อง

```bash
npm install
npm run dev        # เปิด dev server
npm test           # รัน unit tests (29 ข้อ)
npm run build      # build ไปที่ dist/
npm run preview    # พรีวิวผล build
```

## 🌐 Deploy บน GitHub Pages

โปรเจกต์ตั้งค่ามาให้ครบแล้ว (`.github/workflows/deploy.yml` + `base: './'` + hash routing ไม่มีปัญหา 404):

1. สร้าง repository ใหม่บน GitHub แล้ว push โค้ดขึ้น branch `main`
2. ไปที่ **Settings → Pages → Source** เลือก **GitHub Actions**
3. รอ workflow "Deploy to GitHub Pages" รันเสร็จ (push ครั้งแรกจะรันอัตโนมัติ)
4. เว็บจะอยู่ที่ `https://<username>.github.io/<repo-name>/`

## 🗺️ โครงสร้างโปรเจกต์

```
src/
├── core/          # event bus (typed), mini store, h() dom helper
├── sim/           # ⭐ macOS simulator
│   ├── simulator.ts       # ประกอบทุกส่วน + คีย์ลัด + quick look
│   ├── state.ts           # SimState + virtual filesystem
│   ├── windows/           # window manager (drag/resize/traffic lights)
│   ├── menubar/ dock/ desktop/
│   ├── apps/              # Finder, Settings, Terminal, Notes, Safari, ...
│   └── overlays/          # Spotlight, Launchpad, Mission Control, Control Center
├── curriculum/    # หลักสูตรไทย 7 โมดูล เป็น typed data
├── engine/        # ⭐ Tutor engine, progress/XP/badges, trainer
├── app/           # hash router, views, coach panel, navbar
└── styles/        # CSS ล้วน (Liquid Glass aesthetic)
```

## 📚 หลักสูตร

| โมดูล | หัวข้อ | บทเรียน |
|---|---|---|
| 1 | รู้จักหน้าจอ Mac (Desktop, Menu bar, Dock, Traffic lights) | 5 |
| 2 | Finder คู่หูจัดการไฟล์ | 6 |
| 3 | คีย์ลัดและ Spotlight | 6 |
| 4 | System Settings | 5 |
| 5 | แอปและการติดตั้ง (.dmg, App Store) | 5 |
| 6 | ทักษะโปร (Mission Control, Spaces, Stage Manager) | 6 |
| 7 | Pro ขั้นสุดท้าย (Terminal, Activity Monitor, AI) | 5 |

## หมายเหตุการฝึกคีย์ลัด

- ใช้คีย์บอร์ดจริงได้: ปุ่ม **Ctrl ของ Windows = ⌘ ของ Mac** (ระบบแปลงให้อัตโนมัติ)
- คอมโบที่เบราว์เซอร์/Windows สงวนไว้ (เช่น Ctrl+W, Ctrl+Tab) ให้กด **ปุ่ม keycap ในการ์ดบทเรียน** หรือปุ่มลัดในสนามซ้อมแทน — ผลเหมือนกัน 100%
