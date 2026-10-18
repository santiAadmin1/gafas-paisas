// Verifica la integridad del catálogo contra los archivos en /public.
// Lee src/lib/catalog.ts como texto (fuente única) y comprueba:
//  - ids únicos
//  - frontal/lateral/thumb existen en public
//  - los alias (duplicadoDe) apuntan a un id existente
// Uso: node scripts/check-catalog.mjs
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/lib/catalog.ts"), "utf8");

const ids = [...src.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);
const paths = [...src.matchAll(/\b(?:frontal|lateral|thumb):\s*"(\/catalogo\/[^"]+)"/g)].map((m) => m[1]);
const aliases = [...src.matchAll(/duplicadoDe:\s*"([^"]+)"/g)].map((m) => m[1]);

let errors = 0;
const fail = (msg) => { console.error("  ✗ " + msg); errors++; };

const dupIds = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dupIds.length) fail("IDs duplicados: " + dupIds.join(", "));

for (const p of paths) {
  const f = join(root, "public", p.replace(/^\//, ""));
  if (!existsSync(f)) fail("Falta el archivo: " + p);
}
for (const a of aliases) {
  if (!ids.includes(a)) fail("Alias apunta a un id inexistente: " + a);
}

console.log(`Catálogo: ${ids.length} modelos, ${paths.length} rutas de imagen, ${aliases.length} alias.`);
if (errors) { console.error(`\nIntegridad del catálogo: ${errors} error(es).`); process.exit(1); }
console.log("Integridad del catálogo: OK ✓");
