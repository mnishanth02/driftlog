import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIfExists(from, to) {
  if (!fileExists(from)) return false;
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  return true;
}

const repoRoot = process.cwd();

// We keep a backup copy because `expo prebuild --clean` deletes the ios/android dirs.
const backupDir = path.join(repoRoot, "scripts", "local-build");
const privacyBackupPath = path.join(backupDir, "PrivacyInfo.xcprivacy");

const privacyInIosPath = path.join(repoRoot, "ios", "PrivacyInfo.xcprivacy");

// Prefer the tracked iOS privacy file if it exists; otherwise fall back to previous backup.
const havePrivacySource =
  copyFileIfExists(privacyInIosPath, privacyBackupPath) || fileExists(privacyBackupPath);

if (havePrivacySource) {
  // eslint-disable-next-line no-console
  console.log(`[local-prebuild-clean] Backed up PrivacyInfo.xcprivacy -> ${privacyBackupPath}`);
}

// Run a clean prebuild to generate fresh native projects.
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["expo", "prebuild", "--clean"],
  { stdio: "inherit" },
);

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}

// Restore PrivacyInfo.xcprivacy after prebuild, if we have a backup.
if (fileExists(privacyBackupPath)) {
  const restored = copyFileIfExists(privacyBackupPath, privacyInIosPath);
  if (restored) {
    // eslint-disable-next-line no-console
    console.log(`[local-prebuild-clean] Restored PrivacyInfo.xcprivacy -> ${privacyInIosPath}`);
  }
}
