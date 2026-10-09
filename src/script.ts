// ALL on-screen strings, Vietnamese voice-over lines and per-scene footage and UI settings.
// Source of truth: BRIEF.md section 5 (Video A table), 7.2 (end card), 8 (script rules).
// Edit wording and timing here only. Run `npm run check:words` after every edit.
// Vietnamese VO lines are drafts and need a native check [CONFIRM] (BRIEF 5).
// Strings inside the product screens come from src/ui/copy.ts (the landing's ported screens).

// Frame rate: the one constant. Frames are always derived (seconds x FPS).
export const FPS = 60;
// Cursor timing for every action: travel 1.0 to 1.4 s, then a 0.2 s press.
export const CURSOR = { travelSec: 1.0, pressSec: 0.2 };

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
// Action budget (each UI scene): at most 3 actions; each has a pre-hold of at least
// 0.8 s, cursor travel CURSOR.travelSec, a press CURSOR.pressSec, and its result stays
// at least 1.5 s before the next camera move or action. Screen swaps are 0.5 s
// cross-dissolves; each screen keeps its own camera.
export type UiSettings = {
  device: "phone" | "laptop" | "threePhones";
  camera: CameraKey[]; // the opening screen (the cursor works in this view)
  cursor: CursorSettings | null;
  slide?: [number, number]; // slider thumb travels over this window (synced with the cursor drag)
  swapSec?: number; // the next screen starts its cross-dissolve here
  swapCamera?: CameraKey[]; // camera of the next screen
  swap2Sec?: number; // scene 05: the phone (Locked) replaces the laptop here
  swap2Camera?: CameraKey[];
  typing?: [number, number][]; // scene 03: one window per "Done when" item
  files?: number[]; // scene 06: each file is dropped at this time
  scanned?: number[]; // scene 06: each file's fingerprint shows (after the scan line passes it)
  scroll?: [number, number]; // scene 09: list scrolls top to end
  light?: [number, number]; // scene 09: NOT YET rows light one after another
  phones?: { camera: CameraKey[] }[]; // scene 08
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
const dragThumb = (x0: number, x1: number, y: number, slide: [number, number]): CursorTarget => ({
  x: x0,
  y,
  atSec: slide[0] - CURSOR.pressSec,
  action: "drag",
  dragTo: { x: x1, y },
  dragSec: slide[1] - slide[0],
});
// Slider thumbs (centres, screen px): phone bottom slider; the wallet panel's slider on the laptop.
const THUMB = { x0: 45, x1: 345, y: 797 };
const PANEL_THUMB = { x0: 1040, x1: 1298, y: 771 };

const S04_SLIDE: [number, number] = [5.3, 5.8];
const S05_SLIDE: [number, number] = [4.7, 5.2];
const S07_SLIDE: [number, number] = [2.0, 2.5];

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
    endSec: 18,
    theme: "light",
    beats: [{ text: "Your client writes one brief.", atSec: 0.2, accentLast: 1 }],
    vo: "Khách hàng viết một bản mô tả. Dấu vân tay của nó được lưu trên chuỗi.",
    footage: footage(3, "Ch03 brief", 5),
    footageCursor: null,
    ui: {
      device: "laptop",
      // Items 1-3 typed in view, a hold, the camera moves to the brief fingerprint,
      // item 4 is typed while the fingerprint changes, then a hold.
      typing: [
        [0.9, 1.7],
        [1.7, 2.5],
        [2.5, 3.3],
        [4.9, 6.0],
      ],
      camera: [
        { atSec: 0, zoom: 2.0, x: 335, y: 1180 },
        { atSec: 3.9, zoom: 2.0, x: 335, y: 1180 },
        { atSec: 4.7, zoom: 2.0, x: 1176, y: 400 },
      ],
      cursor: null,
    },
  },
  {
    id: "scene04",
    num: 4,
    name: "Step 2 · Accept",
    startSec: 18,
    endSec: 25,
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
      // Contract detail: tap "Accept and choose where earnings go" (travel 0.9-1.9, press),
      // dissolve to the accept screen (VND destination, 2.1-2.6), hold, slide to accept
      // (travel 4.1-5.1, press, drag 5.3-5.8), hold the result. One framing shows the
      // button, the VND card and the slider, so the camera never moves between actions.
      slide: S04_SLIDE,
      swapSec: 2.1,
      camera: [{ atSec: 0, zoom: 1.75, x: 195, y: 566 }],
      swapCamera: [{ atSec: 0, zoom: 1.75, x: 195, y: 566 }],
      cursor: {
        from: { x: 330, y: 480 },
        targets: [
          { x: 195, y: 792, atSec: 1.9, action: "click" },
          dragThumb(THUMB.x0, THUMB.x1, THUMB.y, S04_SLIDE),
        ],
      },
    },
  },
  {
    id: "scene05",
    num: 5,
    name: "Step 3 · Lock",
    startSec: 25,
    endSec: 32,
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
      device: "laptop",
      // Workspace: tap "Lock in wallet" (travel 0.8-1.8, press), the wallet panel opens
      // (dissolve 2.0-2.5), slide to lock in the panel (travel 3.5-4.5, press, drag
      // 4.7-5.2), then your phone shows Locked (device dissolve 5.2-5.7, held to the end).
      slide: S05_SLIDE,
      swapSec: 2.0,
      camera: [{ atSec: 0, zoom: 1.2, x: 1100, y: 460 }],
      swapCamera: [{ atSec: 0, zoom: 1.2, x: 1100, y: 460 }],
      swap2Sec: 5.2,
      swap2Camera: [
        { atSec: 5.2, zoom: 1.8, x: 195, y: 250 },
        { atSec: 7.0, zoom: 1.85, x: 195, y: 250 },
      ],
      cursor: {
        from: { x: 1330, y: 640 },
        targets: [
          { x: 1256, y: 429, atSec: 1.8, action: "click" },
          dragThumb(PANEL_THUMB.x0, PANEL_THUMB.x1, PANEL_THUMB.y, S05_SLIDE),
        ],
        outSec: 5.2,
      },
    },
  },
  {
    id: "scene06",
    num: 6,
    name: "Step 4 · Submit",
    startSec: 32,
    endSec: 39,
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
    scanAtSec: 1.4,
    ui: {
      device: "laptop",
      // Wide view of the submit page: files dropped (0.8, 1.1), the scan band passes
      // (1.4-2.9) and leaves the fingerprints, hold, tap Submit (travel 3.9-4.9, press),
      // dissolve to "Submitted · in review" / "On time" (5.1-5.6) with a slow push-in, held.
      files: [0.8, 1.1],
      scanned: [2.3, 2.4],
      swapSec: 5.1,
      camera: [{ atSec: 0, zoom: 0.72, x: 720, y: 640 }],
      swapCamera: [
        { atSec: 5.1, zoom: 1.0, x: 465, y: 330 },
        { atSec: 7.2, zoom: 1.28, x: 465, y: 330 },
      ],
      cursor: {
        from: { x: 1330, y: 1060 },
        targets: [{ x: 1176, y: 877, atSec: 4.9, action: "click" }],
        outSec: 5.1,
      },
    },
  },
  {
    id: "scene07",
    num: 7,
    name: "Step 5 · Release",
    startSec: 39,
    endSec: 46,
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
      // Review: slide to release (travel 0.8-1.8, press, drag 2.0-2.5), dissolve to
      // "Released to Vinh" (2.5-3.0), then the count-up (see `release`), held.
      slide: S07_SLIDE,
      swapSec: 2.5,
      camera: [{ atSec: 0, zoom: 1.7, x: 195, y: 580 }],
      swapCamera: [
        { atSec: 2.5, zoom: 1.8, x: 195, y: 260 },
        { atSec: 7.0, zoom: 1.85, x: 195, y: 260 },
      ],
      cursor: {
        from: { x: 330, y: 470 },
        targets: [dragThumb(THUMB.x0, THUMB.x1, THUMB.y, S07_SLIDE)],
        outSec: 2.5,
      },
    },
  },
  {
    id: "scene08",
    num: 8,
    name: "If someone goes quiet",
    startSec: 46,
    endSec: 54,
    theme: "dark",
    beats: [{ text: "After the deadline, anyone can release.", atSec: 0.3, accentLast: 2 }],
    small: [{ text: "Unless the client requests changes in time.", atSec: 1.4 }],
    chips: [{ text: "No neutral arbiter yet.", atSec: 6.2 }],
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
      // About 2.5 s per phone: Release now, then Refund now, then Refunded (no cursor).
      active: [
        [2.8, 3.3],
        [5.6, 6.1],
      ],
      phones: [
        { camera: [{ atSec: 0, zoom: 1.8, x: 195, y: 380 }] }, // A · Release now
        { camera: [{ atSec: 0, zoom: 1.8, x: 195, y: 430 }] }, // B · Refund now
        { camera: [{ atSec: 0, zoom: 1.8, x: 195, y: 260 }] }, // C · Refunded
      ],
    },
  },
  {
    id: "scene09",
    num: 9,
    name: "Honest status",
    startSec: 54,
    endSec: 60,
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
    startSec: 60,
    endSec: 69,
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
  pillAtSec: 2.8, // pill with the USDC amount leaves the phone
  crossAtSec: 3.0, // pill crosses the seam
  countStartSec: 3.3, // the count-up starts (scene time)
  countSec: 2.5, // ... and reaches the full amount after this long
};

// Scene 10: end card (BRIEF 7.2). Two link cards, no third card.
export const endCard = {
  links: [
    { title: "Try the app", url: "tdat10052499.github.io/Unihackfest-2026", badge: "Test network" },
    { title: "Open the Workspace", url: "unihackfest-2026.vercel.app", badge: "Test network" },
  ],
  footer: "Built for Unihackfest 2026",
};
