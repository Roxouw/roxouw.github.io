const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const htmlFiles = [];
const ignoredDirs = new Set([".git", "node_modules"]);
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }
}

function isExternal(ref) {
  return /^(?:[a-z]+:)?\/\//i.test(ref);
}

function isIgnorable(ref) {
  return (
    !ref ||
    ref.startsWith("#") ||
    ref.startsWith("mailto:") ||
    ref.startsWith("tel:") ||
    ref.startsWith("javascript:") ||
    ref.startsWith("data:")
  );
}

function stripDecorators(ref) {
  return ref.split("#")[0].split("?")[0];
}

function resolveLocalPath(filePath, ref) {
  const cleanRef = stripDecorators(ref);
  if (!cleanRef) return null;

  if (cleanRef.startsWith("/")) {
    return path.join(repoRoot, cleanRef.slice(1));
  }

  return path.resolve(path.dirname(filePath), cleanRef);
}

function existsLocal(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function scanFile(filePath) {
  const content = fs
    .readFileSync(filePath, "utf8")
    .replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, "");
  const pattern = /\b(?:href|src)=["']([^"']+)["']/gi;

  for (const match of content.matchAll(pattern)) {
    const ref = match[1].trim();
    if (isIgnorable(ref) || isExternal(ref)) continue;

    const resolvedPath = resolveLocalPath(filePath, ref);
    if (!resolvedPath) continue;

    if (!existsLocal(resolvedPath)) {
      findings.push({
        file: path.relative(repoRoot, filePath),
        ref,
        target: path.relative(repoRoot, resolvedPath),
      });
    }
  }
}

walk(repoRoot);
htmlFiles.sort();
htmlFiles.forEach(scanFile);

if (findings.length) {
  console.error("Broken local HTML references found:\n");
  for (const finding of findings) {
    console.error(`- ${finding.file}: "${finding.ref}" -> missing "${finding.target}"`);
  }
  process.exit(1);
}

console.log(`HTML link check passed for ${htmlFiles.length} file(s).`);
