/** โมดูล 5: แอปและการติดตั้ง */

import type { Module } from './types';
import { openFinder, openApps } from './helpers';
import { HOME } from '../sim/state';

export const module5: Module = {
  id: 'm5',
  number: 5,
  title: 'แอปและการติดตั้ง',
  subtitle: 'ลงแอปบน Mac ต่างจาก Windows มาก — ง่ายกว่า และสะอาดกว่า',
  icon: '📦',
  color: 'linear-gradient(135deg,#64d2ff,#0a84ff)',
  badge: { id: 'badge:m5', name: 'นักสะสมแอป', emoji: '🧩', desc: 'รู้จัก App Store, .dmg, การลบแอป และใช้แอปพื้นฐานครบ' },
  lessons: [
    {
      id: 'm5l1',
      title: 'แอปบน Mac มาจากไหน?',
      goal: 'รู้จัก 2 แหล่งหลัก: App Store และไฟล์ .dmg จากเว็บ',
      minutes: 4,
      xp: 50,
      steps: [
        {
          kind: 'info',
          title: '2 แหล่งหลัก (ไม่เหมือน Windows)',
          body: '1) App Store — ร้านแอปในเครื่อง กดรับ จบ ไม่ต้องไปโหลด installer เหมือน Windows 2) เว็บไซต์ผู้พัฒนา — ได้ไฟล์ .dmg (คู่กับ .exe ของ Windows) ที่ต้องลากไปวางในโฟลเดอร์ Applications เอง',
          winTip: 'Windows มี Microsoft Store แต่คนส่วนใหญ่โหลด .exe/.msi จากเว็บ ส่วน Mac ใช้ App Store เยอะกว่ามาก เพราะสแกนมัลแวร์ให้แล้ว',
        },
        {
          kind: 'action',
          instruction: 'เปิด App Store จาก Apple Menu ( → App Store…)',
          target: 'menubar:apple',
          expect: { type: 'menu:click', menu: 'Apple', item: 'App Store…' },
          hint: 'โลโก้แอปเปิ้ล → "App Store…" อยู่กลุ่มเดียวกับการตั้งค่าระบบ',
        },
        {
          kind: 'info',
          title: 'หน้าตา App Store',
          body: 'คล้าย App Store บน iPhone เป๊ะ — ค้นหา, หน้าค้นพบ, ปุ่ม "รับ" สำหรับติดตั้ง แอปจะลงเข้าโฟลเดอร์ Applications อัตโนมัติ ไม่มีขั้นตอน Next Next Next แบบ Windows',
        },
        {
          kind: 'quiz',
          question: 'ข้อไหน "ไม่ใช่" วิธีติดตั้งแอปบน Mac?',
          options: ['ติดตั้งจาก App Store', 'เปิดไฟล์ .dmg แล้วลากแอปไป Applications', 'ดับเบิลคลิก setup.exe', 'ใช้ brew install (สายโปร)'],
          answer: 2,
          explain: '.exe ใช้กับ Windows เท่านั้น! ไฟล์ติดตั้งของ Mac คือ .dmg หรือ .pkg — และโปรแกรมเมอร์ยังมี Homebrew (brew) ที่เทียบเท่า winget อีกชั้น',
        },
      ],
    },
    {
      id: 'm5l2',
      title: 'ติดตั้งจากไฟล์ .dmg ทีละขั้น',
      goal: 'เปิด .dmg และเข้าใจขั้นตอน "ลากไปวาง" อันเลื่องชื่อ',
      minutes: 6,
      xp: 65,
      initial: openFinder([...HOME, 'Downloads']),
      steps: [
        {
          kind: 'info',
          title: 'เปิดโฟลเดอร์ดาวน์โหลด',
          body: 'คุณมีไฟล์ "PixelPaint-Setup.dmg" รออยู่ — .dmg คือ "ภาพดิสก์" (disk image) คิดว่ามันคือไฟล์ zip ที่เปิดแล้วกลายเป็นไดรฟ์เสมือน 1 อัน',
        },
        {
          kind: 'action',
          instruction: 'ดับเบิลคลิกไฟล์ PixelPaint-Setup.dmg เพื่อเปิด (ในบทเรียนนี้จะโชว์พรีวิวให้)',
          target: 'finder-item:file',
          expect: { type: 'file:open', name: 'PixelPaint-Setup.dmg' },
          hint: 'ดับเบิลคลิกที่ไฟล์ .dmg',
        },
        {
          kind: 'info',
          title: 'หน้าต่างติดตั้งแบบ "ลากไปวาง"',
          body: 'บนเครื่องจริง เปิด .dmg แล้วจะเจอหน้าต่างมี: ไอคอนแอป 1 ตัว + ลูกศรชี้โฟลเดอร์ Applications — แปลว่า "ลากแอปไปวางที่โฟลเดอร์นี้" แค่นั้น! ไม่มี Next ไม่มีเลือก path ไม่มี registry',
          winTip: 'ต่างจาก .exe ที่มี wizard ยาวเหยียด — การติดตั้ง Mac คือการก็อปปี้ไฟล์ 1 ชิ้นเข้าโฟลเดอร์เดียว สะอาดมาก',
        },
        {
          kind: 'info',
          title: 'หลังติดตั้งเสร็จ',
          body: 'อย่าลืม: eject ดิสก์ .dmg ทิ้ง (คลิกขวาที่ไดรฟ์ใน sidebar → Eject) แล้วลบไฟล์ .dmg ได้เลย — แอปอยู่ที่ Applications แล้ว เปิดจาก Launchpad หรือ Spotlight ได้ทันที',
        },
        {
          kind: 'quiz',
          question: 'เปิด .dmg แล้วเห็นไอคอนแอป + ลูกศรชี้โฟลเดอร์ Applications — ต้องทำอะไร?',
          options: ['ดับเบิลคลิกลูกศร', 'ลากไอคอนแอปไปวางบนโฟลเดอร์ Applications', 'กดปุ่ม Next 10 หน้า', 'รีสตาร์ทก่อน'],
          answer: 1,
          explain: 'ลากไปวาง = ติดตั้ง จบข่าว — บาง .dmg มีปุ่ม shortcut ให้กดคลิกเดียวก็ย้ายให้เอง',
        },
      ],
    },
    {
      id: 'm5l3',
      title: 'ลบแอป — ง่ายกว่า Windows มาก',
      goal: 'ถอนการติดตั้งแอปให้สะอาดหมดจด',
      minutes: 4,
      xp: 55,
      initial: openFinder(['Applications']),
      steps: [
        {
          kind: 'info',
          title: 'ไม่มี Add/Remove Programs บน Mac!',
          body: 'แอปบน Mac คือไฟล์ .app ก้อนเดียว (bundle) — ลบแอป = ลบไฟล์ก้อนนั้น จบ! ลากไปถังขยะ หรือใช้ Launchpad: กดค้างไอคอนจนสั่น แล้วกด ❌ ตัวเล็ก ๆ',
          winTip: 'Windows ทิ้งเศษ registry, Program Files, AppData ไว้เสมอ ส่วน Mac เก็บทุกอย่างไว้ใน .app ก้อนเดียว (ส่วน preferences เก็บที่ ~/Library แต่เล็กมาก)',
        },
        {
          kind: 'info',
          title: 'โฟลเดอร์ Applications คือที่อยู่ของทุกแอป',
          body: 'เหมือน Program Files ของ Windows แต่ใช้ได้ง่ายกว่า — ทุกแอปเรียงสวย ลากไปใส่ Dock ได้ ลบได้ จัดเรียงได้ เหมือนจัดการไฟล์ทั่วไป',
        },
        {
          kind: 'action',
          instruction: 'ลองสลับมุมมองเป็นรายการ ☰ เพื่อดูรายชื่อแอปทั้งหมด',
          target: 'finder-view-list',
          expect: { type: 'finder:view', view: 'list' },
          hint: 'ปุ่ม ☰ บนแถบเครื่องมือ Finder',
        },
        {
          kind: 'info',
          title: 'เกร็ด: แอปที่โหลด App Store ลบผ่าน Launchpad ได้',
          body: 'กด F4 เปิด Launchpad → กดค้างไอคอนจนไอคอนสั่น → กด ❌ ตรงมุม → ยืนยัน — เหมือนลบแอปบน iPhone เป๊ะ ส่วนแอปนอก App Store ใช้วิธีลากไปถังขยะ',
        },
        {
          kind: 'quiz',
          question: 'คุณลบแอปด้วยการลากไปถังขยะแล้วล้างถังขยะไปเรียบร้อย — ข้อมูลการตั้งค่าแอปหายไหม?',
          options: ['หายหมดจด ไม่มีเศษเหลือใด ๆ', 'อาจเหลือไฟล์ preference เล็ก ๆ ใน ~/Library แต่ไม่รบกวนระบบ', 'แอปกลับมาเองหลังรีสตาร์ท', 'ต้องเรียกใช้ Registry Cleaner'],
          answer: 1,
          explain: 'ตรงไปตรงมา: อาจเหลือไฟล์ตั้งค่าเล็ก ๆ (มีแอปฟรี AppCleaner ช่วยกวาด) แต่ไม่มี registry ให้บวมเหมือน Windows — ระบบไม่เชยช้าลง',
        },
      ],
    },
    {
      id: 'm5l4',
      title: 'ลองใช้แอปโน้ต (Notes)',
      goal: 'สร้างโน้ตแรกในชีวิต Mac',
      minutes: 5,
      xp: 55,
      initial: openApps('notes'),
      steps: [
        {
          kind: 'info',
          title: 'Notes — โน้ตที่ sync ทั้งระบบนิเวศ',
          body: 'แอปโน้ตของ Mac เชื่อมกับ iPhone/iPad ผ่าน iCloud อัตโนมัติ พิมพ์บน Mac ลืมโน้ตไว้ที่บ้าน? หยิบโฟนขึ้นมา โน้ตอยู่ครบ มาลองสร้างกัน',
        },
        {
          kind: 'action',
          instruction: 'กดปุ่ม ✎ (โน้ตใหม่) ที่มุมซ้ายบนของแอปโน้ต',
          target: 'notes-newbtn',
          expect: { type: 'notes:create' },
          hint: 'ปุ่มดินสอ/เขียน มุมซ้ายบนของหน้าต่างโน้ต',
          winTip: 'เทียบเท่า Sticky Notes/OneNote ของ Windows — แต่ Notes บน Mac ซิงก์กับมือถือ Apple โดยไม่ต้องตั้งค่าอะไรเลย',
        },
        {
          kind: 'action',
          instruction: 'พิมพ์หัวข้อว่า "สิ่งที่ต้องทำหลังย้ายมา Mac" ในช่องหัวข้อ',
          target: 'note-title',
          expect: { type: 'notes:edit' },
          hint: 'คลิกช่องหัวข้อด้านบนของพื้นที่พิมพ์ แล้วพิมพ์อะไรก็ได้ (ระบบตรวจแค่ว่าคุณพิมพ์)',
        },
        {
          kind: 'action',
          instruction: 'พิมพ์เนื้อหาโน้ตลงในช่องด้านล่าง — สรุปสิ่งที่เรียนมา 3 ข้อ',
          target: 'note-body',
          expect: { type: 'notes:edit' },
          hint: 'พื้นที่พิมพ์ใหญ่ ๆ ด้านล่างหัวข้อ',
        },
        {
          kind: 'info',
          title: 'โน้ตถูกบันทึกเองทันที',
          body: 'Mac ไม่มีปุ่ม Save ในแอปส่วนใหญ่ (รวมถึงโน้ต) — พิมพ์ปุ๊บ บันทึกปั๊บ ปิดได้เลย อุ่นใจได้ นี่คืออีกจุดที่คน Windows ต้องปรับความเข้าใจ',
        },
      ],
    },
    {
      id: 'm5l5',
      title: 'Safari — เบราว์เซอร์ที่ไม่กินแบต',
      goal: 'ใช้ Safari พื้นฐาน: พิมพ์ URL กดบุ๊กมาร์ก',
      minutes: 5,
      xp: 60,
      initial: openApps('safari'),
      steps: [
        {
          kind: 'info',
          title: 'Safari ไวแค่ไหน?',
          body: 'บนเครื่อง Mac จริง Safari กินแบตน้อยกว่า Chrome ราว 1-3 ชั่วโมงต่อชาร์จ และเป็นเบราว์เซอร์เดียวที่ใช้ tracking protection เต็มรูปแบบของ Apple — คุ้มที่จะให้โอกาส',
        },
        {
          kind: 'action',
          instruction: 'คลิกช่องที่อยู่ (Smart Search field) แล้วพิมพ์ apple.com/th/macos แล้วกด Enter',
          target: 'safari-address',
          expect: { type: 'safari:navigate', url: 'apple.com/th/macos' },
          hint: 'ช่องยาว ๆ ด้านบนของ Safari — พิมพ์แล้ว Enter',
        },
        {
          kind: 'info',
          title: 'อ่านสรุปฟีเจอร์ Tahoe ที่เราเรียนมา',
          body: 'หน้าที่เปิดขึ้นมาคือหน้าจำลองแนะนำ macOS Tahoe — Liquid Glass, Spotlight ใหม่, แอปโทรศัพท์บน Mac ทั้งหมดนี้คือสิ่งที่คุณใช้เป็นแล้ว!',
        },
        {
          kind: 'action',
          instruction: 'กดปุ่มบุ๊กมาร์ก ★ "การสนับสนุนของ Apple" ในแถบด้านล่าง',
          target: 'safari-bookmarks',
          expect: { type: 'safari:navigate', url: 'support.apple.com/th-th' },
          hint: 'ปุ่ม ★ ในแถบใต้ช่องที่อยู่',
        },
        {
          kind: 'quiz',
          question: 'Safari บน Mac เทียบเท่ากับเบราว์เซอร์ไหนของ Windows?',
          options: ['Chrome', 'Microsoft Edge (เบราว์เซอร์ที่มากับระบบ)', 'Firefox', 'Internet Explorer'],
          answer: 1,
          explain: 'ทั้งคู่คือ "เบราว์เซอร์ประจำระบบ" ที่ optimize กับระบบตัวเองที่สุด — ใช้ Chrome บน Mac ได้แน่นอน แต่แบตจะหมดเร็วกว่า',
        },
      ],
    },
  ],
};
