#!/usr/bin/env node
import path from "path";
import { pathToFileURL } from "url";
import { access } from "fs/promises";
import { constants } from "fs";

const workspaceRoot = process.cwd();
const toFileUrl = (...segments: string[]) => pathToFileURL(path.join(workspaceRoot, ...segments)).href;

const ingredientModule = await import(toFileUrl("src", "data", "ingredients.ts"));
const apiLoaderModule = await import(toFileUrl("src", "lib", "apiLoader.ts"));

const { getIngredients, refreshIngredients } = ingredientModule;
const {
  fallbackIngredientImage,
  resolveIngredientImage,
} = apiLoaderModule;

type Candidate = { source: "primary" | "secondary" | "fallback"; url: string };
type Attempt = Candidate & { success: boolean; message?: string };
type IngredientCheck = {
  name: string;
  success: boolean;
  used: Candidate;
  attempts: Attempt[];
};

const checkImage = async (url: string) => {
  if (url.startsWith("/")) {
    const cleanPath = url.replace(/^\/+/, "");
    const filePath = path.join(process.cwd(), "public", cleanPath);
    try {
      await access(filePath, constants.R_OK);
      return { ok: true, message: "local file" };
    } catch (error) {
      return { ok: false, message: `local missing (${(error as Error).message})` };
    }
  }
  try {
    const res = await fetch(url, { method: "GET" });
    return { ok: res.ok, message: `status ${res.status}` };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
};

async function main() {
  await refreshIngredients();
  const allIngredients = getIngredients();
  const results: IngredientCheck[] = [];

  for (const ingredient of allIngredients) {
    const name = ingredient.name;
    const { image: primaryUrl, secondaryImage } = resolveIngredientImage(name);
    const candidateUrls: Candidate[] = [
      { source: "primary", url: primaryUrl },
      ...(secondaryImage ? [{ source: "secondary", url: secondaryImage }] : []),
      { source: "fallback", url: fallbackIngredientImage },
    ].filter(({ url }) => Boolean(url));

    const attemptLog: Attempt[] = [];
    let used: Candidate = candidateUrls[candidateUrls.length - 1];
    let success = false;

    for (const candidate of candidateUrls) {
      const { ok, message } = await checkImage(candidate.url);
      attemptLog.push({ ...candidate, success: ok, message });
      if (ok) {
        used = candidate;
        success = true;
        break;
      }
    }

    results.push({ name, success, used, attempts: attemptLog });
  }

  console.log("Ingredient image check complete\n");

  const missing = results.filter((entry) => !entry.success);
  const secondaryUsed = results.filter((entry) => entry.success && entry.used.source === "secondary");
  const fallbackUsed = results.filter((entry) => entry.used.source === "fallback");

  if (missing.length > 0) {
    console.log(`⚠️ ${missing.length} ingredients still missing proper images:\n`);
    missing.forEach((entry) => {
      console.log(
        `- ${entry.name} (checked ${entry.attempts.map((attempt) => `${attempt.source} -> ${attempt.message ?? "no response"}`).join(", ")})`
      );
    });
    console.log("\nPlease add alternate source URLs or update the API data so these items resolve.");
  } else {
    console.log("✅ All ingredient images resolved successfully.");
  }

  if (secondaryUsed.length > 0) {
    console.log(`\nℹ️ ${secondaryUsed.length} ingredients fell back to the secondary MealDB source.`);
    console.log(secondaryUsed.map((entry) => `  • ${entry.name}`).join("\n"));
  }
  if (fallbackUsed.length > 0) {
    console.log(`\n⚡️ ${fallbackUsed.length} ingredients are using the placeholder fallback image.`);
    console.log(fallbackUsed.map((entry) => `  • ${entry.name}`).join("\n"));
  }

  process.exit(missing.length > 0 ? 1 : 0);
}

main();
