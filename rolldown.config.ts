import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'rolldown';

const sourceRoot = 'src';

function collectTypeScriptInputs(directory: string): string[] {
    const inputs: string[] = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const entryPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            inputs.push(...collectTypeScriptInputs(entryPath));
            continue;
        }

        if (
            entry.isFile()
            && entry.name.endsWith('.ts')
            && !entry.name.endsWith('.spec.ts')
            && !entry.name.endsWith('.type-spec.ts')
            && !entry.name.endsWith('.d.ts')
        ) {
            inputs.push(entryPath.replaceAll('\\', '/'));
        }
    }

    return inputs;
}

export default defineConfig({
    input: collectTypeScriptInputs(sourceRoot).sort(),
    platform: 'neutral',
    output: {
        cleanDir: true,
        dir: 'build',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: sourceRoot,
        minify: true,
        comments: false,
        sourcemap: true,
    },
});
