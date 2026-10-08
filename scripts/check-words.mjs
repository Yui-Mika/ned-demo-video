// Fails if src/script.ts contains a banned word (BRIEF 8.1, 8.3, 8.4, plus extras).
// Usage: node scripts/check-words.mjs [file]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = process.argv[2] ?? path.join(root, "src", "script.ts");

const banned = [
  // BRIEF 8.1, English
  "pay", "payment", "payments", "paid", "paying",
  "escrow", "deposit", "deposits", "invest", "investment", "yield",
  "interest", "safe", "secure", "guaranteed", "guarantee",
  "scam-free", "tax-compliant", "first", "free", "zero fees", "credit score",
  "auto-release", "on its own", "licensed partner", "our partner",
  "payout partner", "nobody can move the funds", "never touches crypto",
  // BRIEF 8.1, Vietnamese
  "thanh toán", "trả tiền", "chi trả", "ký quỹ", "tài khoản ký quỹ",
  "đặt cọc", "tiền cọc", "nạp tiền", "đầu tư", "lợi suất", "lợi nhuận",
  "lãi", "lãi suất", "an toàn", "bảo mật tuyệt đối", "đảm bảo", "bảo đảm",
  "cam kết chắc chắn", "không lừa đảo", "chống lừa đảo", "đúng luật thuế",
  "tuân thủ thuế", "đầu tiên", "duy nhất", "miễn phí", "0 phí", "không mất phí",
  "điểm tín dụng", "tự động giải ngân", "tự động chuyển",
  "đối tác được cấp phép", "đối tác của chúng tôi", "đối tác chi trả",
  "không ai có thể di chuyển tiền", "không bao giờ chạm vào tiền mã hóa",
  // BRIEF 8.3 / 8.4
  "deadlines run on their own", "mainnet", "rẻ nhất", "rẻ hơn",
  // Extra list from the build request
  "automatically", "tự động", "licensed", "cheap", "cheaper", "cheapest", "rẻ",
];

// Reviewed exceptions: exact phrase on a line -> reason. Kept tiny and explicit.
const allowed = [
  {
    word: "first",
    phrase: "The work comes first.",
    reason: "BRIEF 5 scene 01 on-screen line; 'first' is order, not a claim",
  },
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Unicode-aware word boundaries so "pay" does not hit "playbackRate" and "lãi" works.
const toRegex = (w) =>
  new RegExp(`(?<![\\p{L}\\p{N}_])${esc(w).replace(/ /g, "\\s+")}(?![\\p{L}\\p{N}_])`, "iu");

const lines = readFileSync(file, "utf8").normalize("NFC").split(/\r?\n/);
const hits = [];
lines.forEach((line, i) => {
  for (const w of banned) {
    if (!toRegex(w).test(line)) continue;
    const ok = allowed.find((a) => a.word === w && line.includes(a.phrase));
    if (ok) continue;
    hits.push(`${path.relative(root, file)}:${i + 1}: banned "${w}"\n    ${line.trim()}`);
  }
});

if (hits.length) {
  console.error(`check-words: ${hits.length} banned word(s) found\n` + hits.join("\n"));
  process.exit(1);
}
console.log(`check-words: OK (${banned.length} words, ${allowed.length} reviewed exception)`);
