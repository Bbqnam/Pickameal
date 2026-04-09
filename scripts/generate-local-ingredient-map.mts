#!/usr/bin/env node
import { readdir, writeFile } from "fs/promises";
import path from "node:path";

const INGREDIENT_DIR = path.join(process.cwd(), "public", "ingredients");
const OUTFILE = path.join(process.cwd(), "src", "lib", "localIngredientImages.ts");

const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const extensionPriority = [".jpg", ".jpeg", ".webp", ".avif", ".png"];

async function buildMap() {
  const files = await readdir(INGREDIENT_DIR);
  const map = new Map<string, { path: string; priority: number }>();
  for (const file of files) {
    let candidate = file;
    let ext = path.extname(candidate).toLowerCase();
    while (ext && allowedExtensions.has(ext)) {
      candidate = candidate.slice(0, -ext.length);
      ext = path.extname(candidate).toLowerCase();
    }
    if (!candidate) continue;
    const isPlaceholder = candidate.toLowerCase().endsWith("-placeholder");
    const baseName = isPlaceholder ? candidate.slice(0, -"-placeholder".length) : candidate;
    const slugBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slugBase) continue;
    const fullPath = `/ingredients/${file}`;
    const priority = isPlaceholder ? 100 : extensionPriority.indexOf(path.extname(file).toLowerCase());
    if (priority === -1) continue;
    const existing = map.get(slugBase);
    if (!existing || priority < existing.priority) {
      map.set(slugBase, { path: fullPath, priority });
    }
  }
  const record: Record<string, string> = {};
  for (const [slug, entry] of map.entries()) {
    record[slug] = entry.path;
  }
  const content = [
    "/* eslint-disable */",
    "// This file is auto-generated from the contents of public/ingredients.",
    "// Run `node scripts/generate-local-ingredient-map.mts` after adding/removing images.",
    "",
    `export const localIngredientImages: Record<string, string> = ${JSON.stringify(record, null, 2)};`,
    "",
  ].join("\n");
  await writeFile(OUTFILE, content);
}

buildMap().catch((error) => {
  console.error("Failed to generate local ingredient map", error);
  process.exit(1);
});
