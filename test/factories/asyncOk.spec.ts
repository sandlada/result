import { describe, it, expect } from 'vitest';import { asyncOk } from '../../src/index.js';describe('asyncOk', () => {    it('creates a success AsyncResult', async () => {        const r = await asyncOk(42);        expect(r.isSuccess).toBe(true);        if (r.isSuccess) expect(r.value).toBe(42);    });});

