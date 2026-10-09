// ALL on-screen strings, Vietnamese voice-over lines and per-scene footage and UI settings.
// Source of truth: BRIEF.md section 5 (Video A table), 7.2 (end card), 8 (script rules).
// Edit wording and timing here only. Run `npm run check:words` after every edit.
// Vietnamese VO lines are drafts and need a native check [CONFIRM] (BRIEF 5).
// Strings inside the product screens come from src/ui/copy.ts (the landing's ported screens).

export type Theme = "dark" | "light";

export type FootageSettings = {
  file: string; // under public/
  label: string; // shown on the placeholder card when the file is missing
  startSec: number; // trim: where the clip starts in the recording
  endSec: number; // trim: last second of the recording to use
  playbackRate: number; // 1 = normal; 2 = twice as fast
};

// For footage, x and y are fractions (0..1) of the footage frame. For the UI they
// are pixels of the screen itself (phone 390x844, laptop 1440x900), so the cursor
// stays on the element whatever the camera does. atSec is relative to the scene start.
export type CursorTarget = {
  x: number;
  y: number;
  atSec: number;
  action: "click" | "drag";
  dragTo?: { x: number; y: number };
  dragSec?: number;
};

export type CursorSettings = {
  from: { x: number; y: number };
  targets: CursorTarget[];
  outSec?: number; // fade the cursor out at this time
};

// Camera for the flat UI inside a device frame: zoom and the focus point in the
// screen's own pixels. Keys are eased in order.
export type CameraKey = { atSec: number; zoom: number; x: number; y: number };

// Real UI shown when public/footage/sceneNN.mp4 is missing. All times in seconds
// from the scene start; only the fields a scene uses are set.
export type UiSettings = {
  device: "phone" | "laptop" | "threePhones";
  camera: CameraKey[];
  cursor: CursorSettings | null;
  slide?: [number, number]; // slider thumb travels over this window (synced with the cursor drag)
  swapSec?: number; // second screen (locked, released) fades in here
  typing?: [number, number][]; // scene 03: one window per "Done when" item
  files?: number[]; // scene 06: each file is dropped at this time
  scanned?: number[]; // scene 06: each file's fingerprint shows (after the scan line passes it)
  checksSec?: number; // scene 06: "Done when" boxes ticked
  panelSec?: number; // scene 06: wallet panel opens
  doneSec?: number; // scene 06: submitted view
  scroll?: [number, number]; // scene 09: list scrolls top to end
  light?: [number, number]; // scene 09: NOT YET rows light one after another
  phones?: { camera: CameraKey[]; cursor: CursorSettings | null; slide?: [number, number] }[]; // scene 08
  active?: [number, number][]; // scene 08: the centre phone moves to the next one over each window
};

export type Beat = {
  text: string; // 3 to 7 words
  atSec: number; // when the beat starts, relative to the scene start
  untilSec?: number; // when it leaves (omit to stay until the scene ends)
  accentLast?: number; // how many words at the end get the purple gradient
};

export type Scene = {
  id: string; // "scene01" ... used for footage and VO file names
  num: number;
  name: string;
  startSec: number;
  endSec: number;
  theme: Theme;
  beats: Beat[];
  small?: { text: string; atSec: number }[];
  chips?: { text: string; atSec: number }[];
  vo: string; // Vietnamese VO line; also the subtitle
  footage: FootageSettings | null;
  footageCursor: CursorSettings | null; // used over the footage only
  ui: UiSettings | null; // used when the footage file is missing
  scanAtSec?: number; // scene 06: when the scan line starts its pass
};

export const DEMO_CHIP = "Demo on a test network";

const footage = (n: number, label: string, lengthSec: number): FootageSettings => ({
  file: `footage/scene${String(n).padStart(2, "0")}.mp4`,
  label,
  // Clip length = scene length + 1 s (BRIEF 7.1): skip the 0.5 s handle at each end.
  startSec: 0.5,
  endSec: 0.5 + lengthSec,
  playbackRate: 1,
});

// A drag on a slider thumb, timed so the thumb moves exactly over `slide`.
const PRESS = 0.15; // = durations.cursorPress
const dragThumb = (x0: number, x1: number, y: number, slide: [number, number]): CursorTarget => ({
  x: x0,
  y,
  atSec: slide[0] - PRESS,
  action: "drag",
  dragTo: { x: x1, y },
  dragSec: slide[1] - slide[0],
});
// Phone slider thumbs (centres, screen px): bottom slider and the sheet slider.
const THUMB = { x0: 45, x1: 345, y: 797 };
const SHEET_THUMB = { x0: 50, x1: 340, y: 726 };

const S04_SLIDE: [number, number] = [2.7, 3.5];
const S05_SLIDE: [number, number] = [1.9, 2.6];
const S07_SLIDE: [number, number] = [1.1, 1.7];
const S08_SLIDE_A: [number, number] = [2.9, 3.6];
const S08_SLIDE_B: [number, number] = [4.7, 5.4];

export const scenes: Scene[] = [
  {
    id: "scene01",
    num: 1,
    name: "Hook",
    startSec: 0,
    endSec: 6,
    theme: "dark",
    beats: [
      { text: "The work comes first.", atSec: 0.3, accentLast: 0 },
      { text: "The money later.", atSec: 2.4, accentLast: 1 },
    ],
    vo: "Bạn giao việc trước. Tiền đến sau.",
    footage: footage(1, "Ch01 the problem", 6),
    footageCursor: null,
    ui: null, // stays abstract
  },
  {
    id: "scene02",
    num: 2,
    name: "Wordmark + headline",
    startSec: 6,
    endSec: 11,
    theme: "dark",
    beats: [
      { text: "Locked before you start.", atSec: 1.7, untilSec: 3.2, accentLast: 1 },
      { text: "Released when it's approved.", atSec: 3.4, accentLast: 1 },
    ],
    vo: "N.E.D. Khóa trước khi bạn bắt đầu.",
    footage: footage(2, "Ch00 hero", 5),
    footageCursor: null,
    ui: {
      device: "phone",
      camera: [
        { atSec: 2.2, zoom: 1.8, x: 195, y: 190 },
        { atSec: 5.0, zoom: 1.8, x: 195, y: 215 },
      ],
      cursor: null,
    },
  },
  {
    id: "scene03",
    num: 3,
    name: "Step 1 · Brief",
    startSec: 11,
    endSec: 16,
    theme: "light",
    beats: [{ text: "Your client writes one brief.", atSec: 0.2, accentLast: 1 }],
    vo: "Khách hàng viết một bản mô tả. Dấu vân tay của nó được lưu trên chuỗi.",
    footage: footage(3, "Ch03 brief", 5),
    footageCursor: null,
    ui: {
      device: "laptop",
      typing: [
        [0.5, 1.2],
        [1.2, 1.9],
        [1.9, 2.6],
        [3.4, 4.5],
      ],
      camera: [
        { atSec: 0.3, zoom: 2.0, x: 335, y: 1110 },
        { atSec: 2.6, zoom: 2.0, x: 335, y: 1240 },
        { atSec: 3.3, zoom: 2.0, x: 1176, y: 400 },
      ],
      cursor: null,
    },
  },
  {
    id: "scene04",
    num: 4,
    name: "Step 2 · Accept",
    startSec: 16,
    endSec: 21,
    theme: "dark",
    beats: [{ text: "Read the brief. Choose once.", atSec: 0.2, accentLast: 2 }],
    vo: "Bạn đọc, chấp nhận, và chọn một lần nơi nhận tiền.",
    footage: footage(4, "Ch04 accept", 5),
    footageCursor: {
      from: { x: 0.85, y: 0.95 },
      targets: [
        { x: 0.5, y: 0.62, atSec: 1.2, action: "click" },
        { x: 0.36, y: 0.82, atSec: 3.0, action: "drag", dragTo: { x: 0.64, y: 0.82 }, dragSec: 0.7 },
      ],
    },
    ui: {
      device: "phone",
      slide: S04_SLIDE,
      camera: [
        { atSec: 0, zoom: 1.9, x: 195, y: 330 },
        { atSec: 1.6, zoom: 1.9, x: 195, y: 330 },
        { atSec: 2.3, zoom: 1.8, x: 195, y: 650 },
      ],
      cursor: {
        from: { x: 330, y: 560 },
        targets: [
          { x: 200, y: 360, atSec: 1.1, action: "click" },
          dragThumb(THUMB.x0, THUMB.x1, THUMB.y, S04_SLIDE),
        ],
      },
    },
  },
  {
    id: "scene05",
    num: 5,
    name: "Step 3 · Lock",
    startSec: 21,
    endSec: 26,
    theme: "light",
    beats: [{ text: "Your client locks it before you start.", atSec: 0.2, accentLast: 2 }],
    vo: "Khách khóa toàn bộ số tiền trước khi bạn bắt đầu.",
    footage: footage(5, "Ch05 lock", 5),
    footageCursor: {
      from: { x: 0.9, y: 0.9 },
      targets: [
        { x: 0.72, y: 0.3, atSec: 1.0, action: "click" },
        { x: 0.62, y: 0.74, atSec: 2.3, action: "drag", dragTo: { x: 0.86, y: 0.74 }, dragSec: 0.7 },
      ],
    },
    ui: {
      device: "phone",
      slide: S05_SLIDE,
      swapSec: 2.9,
      camera: [
        { atSec: 0, zoom: 1.8, x: 195, y: 200 },
        { atSec: 0.9, zoom: 1.8, x: 195, y: 200 },
        { atSec: 1.5, zoom: 1.8, x: 195, y: 650 },
        { atSec: 2.8, zoom: 1.8, x: 195, y: 650 },
        { atSec: 2.9, zoom: 1.7, x: 195, y: 260 },
        { atSec: 5.0, zoom: 1.8, x: 195, y: 250 },
      ],
      cursor: {
        from: { x: 330, y: 560 },
        targets: [dragThumb(THUMB.x0, THUMB.x1, THUMB.y, S05_SLIDE)],
        outSec: 2.8,
      },
    },
  },
  {
    id: "scene06",
    num: 6,
    name: "Step 4 · Submit",
    startSec: 26,
    endSec: 31,
    theme: "dark",
    beats: [{ text: "Submit before the deadline.", atSec: 0.2, accentLast: 1 }],
    vo: "Nộp trước hạn. Thời gian và dấu vân tay được ghi lại.",
    footage: footage(6, "Ch06 submit", 5),
    footageCursor: {
      from: { x: 0.9, y: 0.95 },
      targets: [
        { x: 0.3, y: 0.78, atSec: 3.0, action: "click" },
        { x: 0.78, y: 0.66, atSec: 4.0, action: "click" },
      ],
    },
    scanAtSec: 0.6,
    ui: {
      device: "laptop",
      files: [0.3, 0.5],
      scanned: [1.65, 1.85],
      checksSec: 2.0,
      panelSec: 3.0,
      doneSec: 3.9,
      camera: [
        { atSec: 0, zoom: 2.0, x: 335, y: 625 },
        { atSec: 2.0, zoom: 2.0, x: 335, y: 625 },
        { atSec: 2.5, zoom: 2.0, x: 1176, y: 860 },
        { atSec: 3.0, zoom: 2.0, x: 1176, y: 860 },
        { atSec: 3.3, zoom: 1.8, x: 1176, y: 560 },
        { atSec: 3.9, zoom: 1.3, x: 450, y: 330 },
        { atSec: 4.3, zoom: 1.3, x: 450, y: 330 },
        { atSec: 4.8, zoom: 2.4, x: 620, y: 395 }, // "On time" 12 px x 2.4 = 29 px
      ],
      cursor: {
        from: { x: 1300, y: 980 },
        targets: [
          { x: 1176, y: 877, atSec: 2.8, action: "click" },
          { x: 1247, y: 696, atSec: 3.6, action: "click" },
        ],
        outSec: 3.9,
      },
    },
  },
  {
    id: "scene07",
    num: 7,
    name: "Step 5 · Release",
    startSec: 31,
    endSec: 36,
    theme: "dark",
    beats: [],
    vo: "Khách duyệt, phần đó được chuyển đến bạn. Ví dụ, ước tính.",
    footage: footage(7, "Ch07 release", 5),
    footageCursor: {
      from: { x: 0.85, y: 0.95 },
      targets: [
        { x: 0.38, y: 0.72, atSec: 0.6, action: "drag", dragTo: { x: 0.66, y: 0.72 }, dragSec: 0.6 },
      ],
    },
    ui: {
      device: "phone",
      slide: S07_SLIDE,
      swapSec: 1.9,
      camera: [
        { atSec: 0, zoom: 1.8, x: 195, y: 330 },
        { atSec: 0.4, zoom: 1.8, x: 195, y: 330 },
        { atSec: 0.9, zoom: 1.8, x: 195, y: 650 },
        { atSec: 1.85, zoom: 1.8, x: 195, y: 650 },
        { atSec: 1.9, zoom: 1.8, x: 195, y: 250 },
      ],
      cursor: {
        from: { x: 330, y: 560 },
        targets: [dragThumb(THUMB.x0, THUMB.x1, THUMB.y, S07_SLIDE)],
        outSec: 1.9,
      },
    },
  },
  {
    id: "scene08",
    num: 8,
    name: "If someone goes quiet",
    startSec: 36,
    endSec: 44,
    theme: "dark",
    beats: [{ text: "After the deadline, anyone can release.", atSec: 0.3, accentLast: 2 }],
    small: [{ text: "Unless the client requests changes in time.", atSec: 1.4 }],
    chips: [{ text: "No neutral arbiter yet.", atSec: 6.0 }],
    vo: "Hết hạn duyệt mà không ai trả lời? Ai cũng có thể bấm Release now, trừ khi khách đã yêu cầu sửa đúng hạn. Trễ hạn nộp? Tiền được hoàn lại cho khách.",
    footage: footage(8, "Ch08 goes quiet", 8),
    footageCursor: {
      from: { x: 0.5, y: 1.0 },
      targets: [
        { x: 0.44, y: 0.78, atSec: 2.6, action: "click" },
        { x: 0.44, y: 0.78, atSec: 3.4, action: "drag", dragTo: { x: 0.56, y: 0.78 }, dragSec: 0.6 },
      ],
    },
    ui: {
      device: "threePhones",
      camera: [],
      cursor: null,
      active: [
        [3.8, 4.3],
        [5.7, 6.2],
      ],
      phones: [
        {
          // A · Release now
          slide: S08_SLIDE_A,
          camera: [
            { atSec: 0, zoom: 1.8, x: 195, y: 290 },
            { atSec: 2.0, zoom: 1.8, x: 195, y: 290 },
            { atSec: 2.6, zoom: 1.8, x: 195, y: 640 },
          ],
          cursor: { from: { x: 300, y: 560 }, targets: [dragThumb(SHEET_THUMB.x0, SHEET_THUMB.x1, SHEET_THUMB.y, S08_SLIDE_A)], outSec: 4.0 },
        },
        {
          // B · Refund now
          slide: S08_SLIDE_B,
          camera: [
            { atSec: 0, zoom: 1.8, x: 195, y: 360 },
            { atSec: 4.2, zoom: 1.8, x: 195, y: 360 },
            { atSec: 4.6, zoom: 1.8, x: 195, y: 640 },
          ],
          cursor: { from: { x: 300, y: 560 }, targets: [dragThumb(SHEET_THUMB.x0, SHEET_THUMB.x1, SHEET_THUMB.y, S08_SLIDE_B)], outSec: 5.8 },
        },
        {
          // C · Refunded
          camera: [{ atSec: 0, zoom: 1.8, x: 195, y: 250 }],
          cursor: null,
        },
      ],
    },
  },
  {
    id: "scene09",
    num: 9,
    name: "Honest status",
    startSec: 44,
    endSec: 50,
    theme: "light",
    beats: [{ text: "What works today, and what comes next.", atSec: 0.2, accentLast: 3 }],
    chips: [{ text: DEMO_CHIP, atSec: 1.2 }],
    vo: "Bản demo chạy trên mạng thử nghiệm, với đối tác chuyển VND (mô phỏng).",
    footage: footage(9, "Ch13 real today", 6),
    footageCursor: null,
    ui: {
      device: "phone",
      scroll: [0.8, 5.4],
      light: [1.2, 4.8],
      // Starts below the intro line, so its version number is not readable (BRIEF 7.1, 2.j).
      camera: [{ atSec: 0, zoom: 2.0, x: 195, y: 390 }], // row titles 14 px x 2 = 28 px
      cursor: null,
    },
  },
  {
    id: "scene10",
    num: 10,
    name: "End card",
    startSec: 50,
    endSec: 60,
    theme: "dark",
    beats: [{ text: "See a milestone released.", atSec: 1.2, accentLast: 1 }],
    chips: [{ text: DEMO_CHIP, atSec: 3.4 }],
    vo: "Thử ứng dụng hoặc mở Workspace, trên mạng thử nghiệm.",
    footage: null,
    footageCursor: null,
    ui: null, // stays abstract
  },
];

// Scene 02 and 10: the wordmark, as text (no logo file).
export const WORDMARK = "N.E.D";

// Scene 07: the big count (climax).
export const release = {
  fromLabel: "$ 250 USDC",
  toValue: 6500000,
  toPrefix: "≈ ",
  toSuffix: " VND",
  estimateNote: "example, estimated",
  simulatedNote: "Bank transfer simulated in this demo.",
  pillAtSec: 2.2, // pill with the USDC amount leaves the phone
  crossAtSec: 2.8, // pill crosses the seam and the count starts
};

// Scene 10: end card (BRIEF 7.2). Two link cards, no third card.
export const endCard = {
  links: [
    { title: "Try the app", url: "tdat10052499.github.io/Unihackfest-2026", badge: "Test network" },
    { title: "Open the Workspace", url: "unihackfest-2026.vercel.app", badge: "Test network" },
  ],
  footer: "Built for Unihackfest 2026",
};
