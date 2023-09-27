import * as child_process from "node:child_process";
import * as fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync("./manifest.json", { encoding: 'utf-8' }));

const cmd = `arch-rebuild-order --repos core ${manifest.map(pkge => pkge.packageName).join(' ')}`

console.log(`Running ${cmd}...`);

const result = child_process.execSync(cmd, { encoding: 'utf-8' });

const ordering = result.split(' ').map(pkg => pkg.trim()).filter(pkg => manifest.some(man => man.packageName === pkg));

for (const pkg of ordering) {
    console.log(`cd ./core/${pkg} && makepkg -A --skippgpcheck`);

    child_process.execSync(`cd ./core/${pkg} && makepkg -ACf --skippgpcheck`, { shell: 'bash', });
}

