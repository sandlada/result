/**
 * SPEC § Sentinel Pattern — 哨兵模式測試
 *
 * 涵蓋：
 * - error 屬性總是可訪問（從不拋出）
 * - 成功結果的 error 是內部哨兵值
 * - 失敗結果的 error 是實際錯誤物件
 * - 使用者應先檢查 isSuccess 再使用 error
 */
import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';

// ─── Error Always Accessible ────────────────────────────────────

describe('Error always accessible', () => {
    it('success result error does not throw', () => {
        const ok = Result.Success();
        expect(() => ok.error).not.toThrow();
    });

    it('typed success result error does not throw', () => {
        const ok = Result.Success(42);
        expect(() => ok.error).not.toThrow();
    });

    it('failure result error does not throw', () => {
        const err = Result.Failure(new Error('fail'));
        expect(() => err.error).not.toThrow();
    });
});

// ─── Sentinel vs Real Error ─────────────────────────────────────

describe('Sentinel vs real error', () => {
    it('success result error is the sentinel value', () => {
        const ok = Result.Success();
        expect(ok.error).not.toBeInstanceOf(Error);
        // 哨兵不應該是真正的錯誤
    });

    it('failure result error is the actual error', () => {
        const error = new Error('specific error');
        const err = Result.Failure(error);
        expect(err.error).toBe(error);
    });

    it('failure result error preserves custom properties', () => {
        const err = Result.Failure({ code: 500, reason: 'Internal' });
        expect(err.error.code).toBe(500);
        expect(err.error.reason).toBe('Internal');
    });
});

// ─── Usage Pattern: Check isSuccess First ───────────────────────

describe('Check isSuccess before interpreting error', () => {
    it('consumer pattern: only read error when isFailure', () => {
        function handleError(r: { isSuccess: boolean; error: unknown }) {
            if (!r.isSuccess) {
                return String(r.error);
            }
            return 'ok';
        }

        const success = Result.Success();
        const failure = Result.Failure(new Error('boom'));

        expect(handleError(success)).toBe('ok');
        expect(handleError(failure)).toContain('boom');
    });

    it('failure error retains identity across references', () => {
        const original = new Error('original');
        const err = Result.Failure(original);
        expect(err.error).toBe(original);
    });
});
