const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "..", "Frontend", "Products");
const webPublicRoot = path.join(root, "www");
const androidPublicRoot = path.join(root, "android", "app", "src", "main", "assets", "public");

const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => imageExts.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));
}

function humanize(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildManifest() {
  return fs.readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true, sensitivity: "base" }))
    .map((groupDir) => {
      const groupPath = path.join(sourceRoot, groupDir.name);
      const images = listImages(groupPath).map((file) => ({
        name: humanize(file),
        imageUrl: `Products/${groupDir.name}/${file}`,
      }));
      return {
        key: groupDir.name,
        label: groupDir.name,
        items: images,
      };
    });
}

function writeManifest(targetDir, manifest) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "products-manifest.json"), JSON.stringify(manifest, null, 2));
}

const manifest = buildManifest();
writeManifest(webPublicRoot, manifest);
writeManifest(androidPublicRoot, manifest);

