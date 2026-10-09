// Fails if anything the video can show contains a banned word (BRIEF 8.1, 8.3, 8.4, plus extras).
// Scans src/script.ts (every line) and the copied screens in src/ui (string literals and JSX text only;
// comments and code identifiers are not shown in the video).
// Usage: node scripts/check-words.mjs [file ...]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const banned = [
  // BRIEF 8.1, English. ("payout partner" is banned in Vietnamese only, as "đối tác chi trả" below;
  // the English wording "payout partner (simulated in the demo)" is the one BRIEF 2.g asks for.)
  "pay", "payment", "payments", "paid", "paying",
  "escrow", "deposit", "deposits", "invest", "investment", "yield",
  "interest", "safe", "secure", "guaranteed", "guarantee",
  "scam-free", "tax-compliant", "first", "free", "zero fees", "credit score",
  "auto-release", "on its own", "licensed partner", "our partner",
  "nobody can move the funds", "never touches crypto",
  // BRIEF 8.1, Vietnamese
  "thanh toán", "trả tiền", "chi trả", "ký quỹ", "tài khoản ký quỹ",
  "đặt cọc", "tiền cọc", "nạp tiền", "đầu tư", "lợi suất", "lợi nhuận",
  "lãi", "lãi suất", "an toàn", "bảo mật tuyệt đối", "đảm bảo", "bảo đảm",
  "cam kết chắc chắn", "không lừa đảo", "chống lừa đảo", "đúng luật thuế",
  "tuân thủ thuế", "đầu tiên", "duy nhất", "miễn phí", "0 phí", "không mất phí",
  "điểm tín dụng", "tự động giải ngân", "tự động chuyển",
  "đối tác được cấp phép", "đối tác của chúng tôi", "đối tác chi trả",
  "không ai có thể di chuyển tiền", "không bao giờ chạm vào tiền mã hóa",
  // BRIEF 8.3 / 8.4 and section 2
  "deadlines run on their own", "mainnet", "rẻ nhất", "rẻ hơn",
  "may dispute", "unless you dispute", "you never hold crypto", "ned.app",
  // Extra list from the build request
  "automatically", "tự động", "licensed", "cheap", "cheaper", "cheapest", "rẻ",
];

// Reviewed exceptions: exact phrase on a line -> reason. Kept tiny and explicit.
const allowed = [
  { word: "first", phrase: "The work comes first.", reason: "BRIEF 5 scene 01 on-screen line; order, not a claim" },
  { word: "first", phrase: "before the first deadline", reason: "landing copy web.contractNew.summary.checked; order, not a claim" },
  { word: "first", phrase: "where to look first.", reason: "landing copy web.submit.note.placeholder (not shown: the note has a value); order, not a claim" },
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Unicode-aware word boundaries so "pay" does not hit "playbackRate" and "lãi" works.
const toRegex = (w) =>
  new RegExp(`(?<![\\p{L}\\p{N}_])${esc(w).replace(/ /g, "\\s+")}(?![\\p{L}\\p{N}_])`, "iu");
const regexes = banned.map((w) => [w, toRegex(w)]);

// Visible text of a TS/TSX file: string literals and JSX text, with their line numbers.
const visibleText = (src) => {
  const out = []; // [line, text]
  let i = 0;
  let line = 1;
  let code = ""; // code with strings and comments blanked, for the JSX-text pass
  const codeLines = [];
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && n === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") { line++; codeLines.push(code); code = ""; }
        i++;
      }
      i += 2;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      const startLine = line;
      let s = "";
      i++;
      while (i < src.length && src[i] !== c) {
        if (src[i] === "\\") { s += src[i + 1]; i += 2; continue; }
        if (src[i] === "\n") { line++; codeLines.push(code); code = ""; }
        s += src[i];
        i++;
      }
      i++;
      out.push([startLine, s]);
      code += '""';
      continue;
    }
    if (c === "\n") { line++; codeLines.push(code); code = ""; i++; continue; }
    code += c;
    i++;
  }
  codeLines.push(code);
  codeLines.forEach((l, k) => {
    for (const m of l.matchAll(/>([^<>{}]*\p{L}[^<>{}]*)</gu)) out.push([k + 1, m[1]]);
  });
  return out;
};

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });

const targets = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => ({ file: path.resolve(f), mode: "lines" }))
  : [
      { file: path.join(root, "src", "script.ts"), mode: "lines" },
      ...walk(path.join(root, "src", "ui")).map((file) => ({ file, mode: "visible" })),
    ];

const hits = [];
for (const { file, mode } of targets) {
  const src = readFileSync(file, "utf8").normalize("NFC");
  const units = mode === "lines" ? src.split(/\r?\n/).map((t, k) => [k + 1, t]) : visibleText(src);
  for (const [ln, text] of units) {
    for (const [w, re] of regexes) {
      if (!re.test(text)) continue;
      if (allowed.some((a) => a.word === w && text.includes(a.phrase))) continue;
      hits.push(`${path.relative(root, file)}:${ln}: banned "${w}"\n    ${text.trim().slice(0, 160)}`);
    }
  }
}

if (hits.length) {
  console.error(`check-words: ${hits.length} banned word(s) found\n` + hits.join("\n"));
  process.exit(1);
}
console.log(`check-words: OK (${targets.length} files, ${banned.length} words, ${allowed.length} reviewed exceptions)`);
