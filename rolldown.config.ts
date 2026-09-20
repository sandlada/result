import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'rolldown';

const sourceRoot = 'src';

function collectTypeScriptInputs(directory: string): string[] {
    const inputs: string[] = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const entryPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            // Test infrastructure is never imported by a published module, so
            // directories named `tests` must not reach `build/`.
            if (entry.name === 'tests') {
                continue;
            }

            inputs.push(...collectTypeScriptInputs(entryPath));
            continue;
        }

        if (
            entry.isFile()
            && entry.name.endsWith('.ts')
            && !entry.name.endsWith('.bench.ts')
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
        // `npm run build` empties `build/` before this runs, so the directory is not
        // cleaned here: cleaning at this point would delete the declarations that
        // `npm run build:types` emitted earlier in the same build.
        dir: 'build',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: sourceRoot,
        minify: true,
        comments: false,
        sourcemap: true,
    },
});
