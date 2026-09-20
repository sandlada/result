// Type-checked mirrors of the examples in `src/content/docs/getting-started.md`.
//
// `npm run check:snippets` compiles this file against the built declaration
// files, so a documentation example that stops compiling fails the docs build.
import { pipe } from '@sandlada/result/composition';
import { err, ok } from '@sandlada/result/factories';
import { map, unwrapOr } from '@sandlada/result/operators';
import type { IResultOfT } from '@sandlada/result';

type User = { id: string; name: string };

type AppError =
    | { kind: 'NotFound'; id: string }
    | { kind: 'Validation'; fields: Record<string, string> };

const users = new Map<string, User>([['42', { id: '42', name: 'Alice' }]]);

function getUser(id: string): IResultOfT<User, AppError> {
    if (!id) {
        return err<AppError>({ kind: 'Validation', fields: { id: 'Required' } }) as IResultOfT<User, AppError>;
    }

    const user = users.get(id);

    if (!user) {
        return err<AppError>({ kind: 'NotFound', id }) as IResultOfT<User, AppError>;
    }

    return ok(user);
}

export const name: string = pipe(
    getUser('42'),
    map((user) => user.name),
    unwrapOr('Unknown'),
);

export const doubled: number = pipe(
    ok(21),
    map((value) => value * 2),
    unwrapOr(0),
);
