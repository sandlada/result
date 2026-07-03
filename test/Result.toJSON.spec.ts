import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';

describe('Result.toJSON — void Result', () => {
    it('Success serializes via JSON.stringify', () => {
        const r = ok();
        const parsed = JSON.parse(JSON.stringify(r));
        expect(parsed).toMatchObject({ isSuccess: true });
    });

    it('Failure serializes via JSON.stringify', () => {
        const r = err('boom');
        const parsed = JSON.parse(JSON.stringify(r));
        expect(parsed).toMatchObject({ isSuccess: false, error: 'boom' });
    });

    it('JSON.stringify on Success', () => {
        const json = JSON.stringify(ok());
        const parsed = JSON.parse(json);
        expect(parsed.isSuccess).toBe(true);
        expect(parsed.isFailure).toBe(false);
    });

    it('JSON.stringify on Failure', () => {
        const json = JSON.stringify(err(new Error('fail')));
        const parsed = JSON.parse(json);
        expect(parsed.isSuccess).toBe(false);
        expect(parsed.error).toBeDefined();
    });
});

describe('toJSON — value Result', () => {
    it('Success serializes via JSON.stringify', () => {
        const r = ok(42);
        const parsed = JSON.parse(JSON.stringify(r));
        expect(parsed).toMatchObject({ isSuccess: true, value: 42 });
    });

    it('Failure serializes via JSON.stringify', () => {
        const r = err<number, string>('nope');
        const parsed = JSON.parse(JSON.stringify(r));
        expect(parsed).toMatchObject({ isSuccess: false, error: 'nope' });
    });

    it('JSON.stringify on Success with object value', () => {
        const r = ok({ name: 'Alice' });
        const parsed = JSON.parse(JSON.stringify(r));
        expect(parsed).toMatchObject({ isSuccess: true, value: { name: 'Alice' } });
    });
});
