import * as fs from 'node:fs';
import * as child_process from 'node:child_process'

const manifest = JSON.parse(fs.readFileSync("./manifest.json", { encoding: 'utf-8' }))


try {
    fs.mkdirSync('./core');
} catch { }

for (const entry of manifest) {
    const { packageName: pkge } = entry;

    if (entry.type === 'overlay') {
        if (fs.existsSync(`./overlay/core/${pkge}/PKGBUILD`)) {
            if (!fs.existsSync(`./core/${pkge}/PKGBUILD`)) {
                try {

                    console.log(`Adding missing link to overlay for ${pkge}...`)


                    fs.symlinkSync(`./overlay/core/${pkge}/`, `./core/${pkge}/`);
                } catch { }
            }
        }
    } else if (entry.type === 'git') {
        try {
            if (!fs.existsSync(`./core/${pkge}/PKGBUILD`)) {
                console.log(`Cloning ${pkge}...`);
                child_process.execSync(`git submodule add --force https://gitlab.archlinux.org/archlinux/packaging/packages/${pkge}.git ./core/${pkge}`, {
                    env: {
                        GIT_TERMINAL_PROMPT: 0
                    }
                });
            } else {
                console.log(`Syncing ${pkge}...`);

                child_process.execSync(`cd ./core/${pkge} && git pull`, {
                    env: {
                        GIT_TERMINAL_PROMPT: 0
                    }
                });
            }
        } catch (error) {
            console.error(error);
            console.log(`Unknown source for package ${pkge}`);
        }
    } else {
        console.error(`Unknown type ${entry.type} for ${entry.packageName}`);
    }
}