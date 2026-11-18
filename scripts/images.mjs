import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = "images-src";
const OUTPUT_DIR = path.join("src", "assets", "images");
const WIDTHS = [400, 800];
const SOURCE_PATTERN = /\.(jpe?g|png)$/i;

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function render(input, name, width, fallbackFormat) {
    const base = sharp(input).resize({ width, withoutEnlargement: true });
    const variants = [
        { ext: "avif", image: base.clone().avif({ quality: 50, effort: 4 }) },
        { ext: "webp", image: base.clone().webp({ quality: 76 }) },
        {
            ext: fallbackFormat,
            image:
                fallbackFormat === "png"
                    ? base.clone().png({ compressionLevel: 9, palette: true })
                    : base.clone().jpeg({ quality: 78, mozjpeg: true }),
        },
    ];

    const files = [];
    for (const { ext, image } of variants) {
        const file = path.join(OUTPUT_DIR, `${name}-${width}.${ext}`);
        await image.toFile(file);
        files.push({ file, bytes: (await stat(file)).size });
    }

    return files;
}

async function main() {
    const sources = (await readdir(SOURCE_DIR)).filter((file) => SOURCE_PATTERN.test(file)).sort();

    if (!sources.length) {
        throw new Error(`No source images found in ${SOURCE_DIR}/.`);
    }

    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });

    let sourceTotal = 0;
    let outputTotal = 0;
    const rows = [];

    for (const source of sources) {
        const input = path.join(SOURCE_DIR, source);
        const name = path.parse(source).name;
        const { width, hasAlpha } = await sharp(input).metadata();
        const fallbackFormat = hasAlpha ? "png" : "jpg";
        const sourceBytes = (await stat(input)).size;
        const outputs = [];

        for (const targetWidth of WIDTHS) {
            outputs.push(...(await render(input, name, Math.min(targetWidth, width), fallbackFormat)));
        }

        const outputBytes = outputs.reduce((total, file) => total + file.bytes, 0);
        sourceTotal += sourceBytes;
        outputTotal += outputBytes;
        rows.push({
            name,
            sourceWidth: width,
            fallbackFormat,
            sourceBytes,
            outputBytes,
            variants: outputs.map((file) => `${path.basename(file.file)} ${kb(file.bytes)}`),
        });
    }

    for (const row of rows) {
        const fallbackNote = row.fallbackFormat === "png" ? " (PNG fallback: alpha source)" : "";
        console.log(`${row.name}: ${kb(row.sourceBytes)} -> ${kb(row.outputBytes)}${fallbackNote}`);
        console.log(`  ${row.variants.join("\n  ")}`);
    }

    const saved = sourceTotal - outputTotal;
    const percent = ((saved / sourceTotal) * 100).toFixed(1);
    console.log(`\nSources: ${rows.length} files, ${kb(sourceTotal)}`);
    console.log(`Generated: ${rows.length * WIDTHS.length * 3} files, ${kb(outputTotal)}`);
    console.log(`Saved: ${kb(saved)} (${percent}%)`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
