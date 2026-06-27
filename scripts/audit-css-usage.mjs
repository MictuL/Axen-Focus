import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cssEntryPath = path.join(root, "src/styles.css");
const sourceRoot = path.join(root, "src");

function walkFiles(dir, matches, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, matches, files);
      continue;
    }
    if (matches.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripComments(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import\s+[^;]+;/g, "");
}

function collectCssClassNames(css) {
  const names = new Set();
  for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
    const name = match[1];
    if (!/^\d/.test(name)) names.add(name);
  }
  return [...names].sort();
}

function collectDynamicPrefixes(source) {
  const prefixes = new Set();
  for (const match of source.matchAll(/["'`]([a-zA-Z][a-zA-Z0-9_-]+-)["'`]/g)) {
    prefixes.add(match[1]);
  }
  for (const match of source.matchAll(/([a-zA-Z][a-zA-Z0-9_-]+-)\$\{/g)) {
    prefixes.add(match[1]);
  }
  for (const match of source.matchAll(/\bclassName\s*=\s*{`([^`]+)`}/g)) {
    for (const fragment of match[1].matchAll(/\b([a-zA-Z][a-zA-Z0-9_-]+-)\$\{/g)) {
      prefixes.add(fragment[1]);
    }
  }
  return [...prefixes].sort();
}

function collectCssVariables(css) {
  const definitions = new Set();
  const uses = new Set();
  for (const match of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) definitions.add(match[1]);
  for (const match of css.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) uses.add(match[1]);
  return {
    definitions: [...definitions].sort(),
    unused: [...definitions].filter((name) => !uses.has(name)).sort(),
  };
}

function collectKeyframes(css) {
  const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]);
  return {
    names,
    unused: names.filter((name) => {
      const occurrences = css.match(new RegExp(`\\b${escapeRegex(name)}\\b`, "g")) ?? [];
      return occurrences.length <= 1;
    }),
  };
}

if (!fs.existsSync(cssEntryPath)) {
  console.error("No se encontro src/styles.css");
  process.exit(1);
}

const cssFiles = walkFiles(sourceRoot, /\.css$/);
const css = stripComments(cssFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n"));
const sourceFiles = walkFiles(sourceRoot, /\.(tsx?|jsx?)$/);
const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const classNames = collectCssClassNames(css);
const dynamicPrefixes = collectDynamicPrefixes(source);
const exact = [];
const dynamic = [];
const candidates = [];

for (const className of classNames) {
  const exactPattern = new RegExp(`(?<![A-Za-z0-9_-])${escapeRegex(className)}(?![A-Za-z0-9_-])`);
  if (exactPattern.test(source)) {
    exact.push(className);
    continue;
  }
  const matchedPrefix = dynamicPrefixes.find((prefix) => className.startsWith(prefix));
  if (matchedPrefix) {
    dynamic.push({ className, matchedPrefix });
    continue;
  }
  candidates.push(className);
}

const variables = collectCssVariables(css);
const keyframes = collectKeyframes(css);
const summary = {
  cssFiles: cssFiles.map((file) => path.relative(root, file)).sort(),
  cssLines: css.split("\n").length,
  sourceFiles: sourceFiles.length,
  ruleBlocks: (css.match(/{/g) ?? []).length,
  mediaBlocks: (css.match(/@media/g) ?? []).length,
  classes: {
    total: classNames.length,
    exactUsed: exact.length,
    possibleDynamic: dynamic.length,
    candidatesForReview: candidates.length,
  },
  cssVariables: {
    total: variables.definitions.length,
    unused: variables.unused,
  },
  keyframes,
  candidatesForReview: candidates,
};

console.log(JSON.stringify(summary, null, 2));
