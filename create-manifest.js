import { packages } from "./packages.js";
import * as fs from 'node:fs';
import * as child_process from 'node:child_process'


try {
    fs.mkdirSync('./core');

} catch { }

const manifest = [];

for (const pkge of packages) {
    if (pkge.endsWith('-debug')) {
        console.log(`Skipping ${pkge}`);
        continue;
    }

    if (fs.existsSync(`./overlay/core/${pkge}/PKGBUILD`)) {

        console.log(`Linking ${pkge}...`)

        manifest.push({
            type: 'overlay',
            db: 'core',
            packageName: pkge,
        });
    } else if (fs.existsSync(`./core/${pkge}/PKGBUILD`)) {
        manifest.push({
            type: 'git',
            db: 'core',
            packageName: pkge,
        });
    } else {
        try {
            console.log(`Cloning ${pkge}...`);
            child_process.execSync(`cd clones && git clone https://gitlab.archlinux.org/archlinux/packaging/packages/${pkge}.git`, {
                env: {
                    GIT_TERMINAL_PROMPT: 0
                }
            });

            manifest.push({
                type: 'git',
                url: `https://gitlab.archlinux.org/archlinux/packaging/packages/${pkge}.git`,
                db: 'core',
                packageName: pkge,
            });
        } catch {
            console.log(`Unknown source for package ${pkge}`);

            manifest.push({
                type: 'unknown',
                db: 'core',
                packageName: pkge,
            });
        }
    }
}

fs.writeFileSync('./manifest.json', JSON.stringify(manifest, null, 4))