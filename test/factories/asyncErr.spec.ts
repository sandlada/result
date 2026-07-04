import { describe, it, expect } from 'vitest';import { asyncErr } from '../../src/index.js';describe('asyncErr', () => {    it('creates a failure AsyncResult', async () => {        const r = await asyncErr('bad');        expect(r.isFailure).toBe(true);        if (r.isFailure) expect(r.error).toBe('bad');    });});

