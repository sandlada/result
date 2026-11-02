// Rejects numbered working-note markers inside comments under src/.
// String literals are skipped so a user-facing message can still contain digits.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(repositoryRoot, 'src');
const marker = /\[[A-Za-z]+[-_]?\d+\]|\b(?:BUG|FIX|TASK|ISSUE)[-_]?\d+\b/;

const problems = [];

for (const file of collect(sourceRoot)) {
    const text = readFileSync(file, 'utf8');
    for (const comment of commentsIn(text)) {
        if (!marker.test(comment.text)) continue;
        const line = text.slice(0, comment.start).split('\n').length;
        problems.push(`${relative(repositoryRoot, file).replaceAll('\\', '/')}:${line}`);
    }
}

if (problems.length > 0) {
    console.error('Numbered markers in source comments:\n');
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
}

console.log('Verified source comments contain no numbered markers.');

function collect(directory) {
    const files = [];
    for (const entry of readdirSync(directory)) {
        const path = join(directory, entry);
        if (statSync(path).isDirectory()) {
            files.push(...collect(path));
            continue;
        }
        if (entry.endsWith('.ts')) files.push(path);
    }
    return files;
}

function commentsIn(source) {
    const comments = [];
    let i = 0;
    while (i < source.length) {
        const pair = source.slice(i, i + 2);
        if (pair === '//') {
            const end = source.indexOf('\n', i);
            const stop = end === -1 ? source.length : end;
            comments.push({ start: i, text: source.slice(i, stop) });
            i = stop + 1;
            continue;
        }
        if (pair === '/*') {
            const end = source.indexOf('*/', i + 2);
            const stop = end === -1 ? source.length : end + 2;
            comments.push({ start: i, text: source.slice(i, stop) });
            i = stop;
            continue;
        }
        const quote = source[i];
        if (quote === "'" || quote === '"' || quote === '`') {
            i = skipString(source, i, quote);
            continue;
        }
        i += 1;
    }
    return comments;
}

function skipString(source, start, quote) {
    let i = start + 1;
    while (i < source.length) {
        if (source[i] === '\\') {
            i += 2;
            continue;
        }
        if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
            i += 2;
            let depth = 1;
            while (i < source.length && depth > 0) {
                if (source[i] === '{') depth += 1;
                else if (source[i] === '}') depth -= 1;
                i += 1;
            }
            continue;
        }
        if (source[i] === quote) return i + 1;
        i += 1;
    }
    return source.length;
}
