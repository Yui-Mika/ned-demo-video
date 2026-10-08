// ALL on-screen strings, Vietnamese voice-over lines and per-scene footage settings.
// Source of truth: BRIEF.md section 5 (Video A table), 7.2 (end card), 8 (script rules).
// Edit wording and timing here only. Run `npm run check:words` after every edit.
// Vietnamese VO lines are drafts and need a native check [CONFIRM] (BRIEF 5).

export type Theme = "dark" | "light";

export type FootageSettings = {
  file: string; // under public/
  label: string; // shown on the placeholder card when the file is missing
  startSec: number; // trim: where the clip starts in the recording
  endSec: number; // trim: last second of the recording to use
  playbackRate: number; // 1 = normal; 2 = twice as fast
};

// x and y are fractions (0..1) of the footage frame, so the cursor stays on the
// same spot of the recording. atSec is relative to the scene start.
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
  cursor: CursorSettings | null;
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
    cursor: null,
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
    cursor: null,
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
    cursor: null,
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
    cursor: {
      from: { x: 0.85, y: 0.95 },
      targets: [
        { x: 0.5, y: 0.62, atSec: 1.2, action: "click" },
        { x: 0.36, y: 0.82, atSec: 3.0, action: "drag", dragTo: { x: 0.64, y: 0.82 }, dragSec: 0.7 },
      ],
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
    cursor: {
      from: { x: 0.9, y: 0.9 },
      targets: [
        { x: 0.72, y: 0.3, atSec: 1.0, action: "click" },
        { x: 0.62, y: 0.74, atSec: 2.3, action: "drag", dragTo: { x: 0.86, y: 0.74 }, dragSec: 0.7 },
      ],
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
    scanAtSec: 1.4,
    cursor: {
      from: { x: 0.9, y: 0.95 },
      targets: [
        { x: 0.3, y: 0.78, atSec: 3.0, action: "click" },
        { x: 0.78, y: 0.66, atSec: 4.0, action: "click" },
      ],
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
    cursor: {
      from: { x: 0.85, y: 0.95 },
      targets: [
        { x: 0.38, y: 0.72, atSec: 0.6, action: "drag", dragTo: { x: 0.66, y: 0.72 }, dragSec: 0.6 },
      ],
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
    chips: [{ text: "No neutral arbiter yet.", atSec: 5.2 }],
    vo: "Hết hạn duyệt mà không ai trả lời? Ai cũng có thể bấm Release now, trừ khi khách đã yêu cầu sửa đúng hạn. Trễ hạn nộp? Tiền được hoàn lại cho khách.",
    footage: footage(8, "Ch08 goes quiet", 8),
    cursor: {
      from: { x: 0.5, y: 1.0 },
      targets: [
        { x: 0.44, y: 0.78, atSec: 2.6, action: "click" },
        { x: 0.44, y: 0.78, atSec: 3.4, action: "drag", dragTo: { x: 0.56, y: 0.78 }, dragSec: 0.6 },
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
    cursor: null,
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
    cursor: null,
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
  pillAtSec: 1.7, // pill with the USDC amount appears
  crossAtSec: 2.4, // pill crosses the seam and the count starts
};

// Scene 10: end card (BRIEF 7.2). Two link cards, no third card.
export const endCard = {
  links: [
    { title: "Try the app", url: "tdat10052499.github.io/Unihackfest-2026", badge: "Test network" },
    { title: "Open the Workspace", url: "unihackfest-2026.vercel.app", badge: "Test network" },
  ],
  footer: "Built for Unihackfest 2026",
};
