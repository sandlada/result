import { fromOption, pipe, toOption } from '@sandlada/result';
import {
    bind, map, match, ofNone, ofSome,
} from '@sandlada/result/option';
import type { IOption, IResultOfT } from '@sandlada/result';
import { wireExample } from './demo-ui.js';
import { customers } from './mock-api.js';
import type { DemoError } from './mock-api.js';

function inspectPhone(phoneValue?: string): object {
    const phone: IOption<string> = phoneValue ? ofSome(phoneValue) : ofNone();
    const normalized = pipe(
        phone,
        map(value => value.replaceAll(' ', '')),
        bind(value => value.startsWith('+') ? ofSome(value) : ofNone()),
    );

    const message = pipe(
        normalized,
        match(
            value => `SMS notifications enabled for ${value}`,
            () => 'No valid phone number; email notifications remain enabled',
        ),
    );

    const asResult: IResultOfT<string, DemoError> = fromOption(
        { kind: 'NotFound', resource: 'customer.phone' } as DemoError,
        normalized,
    );

    return { message, option: normalized, result: asResult, roundTrip: toOption(asResult) };
}

wireExample('#phone-present', 'Option / Some path', () => inspectPhone('+886 912 345 678'));
wireExample('#phone-missing', 'Option / None and Result adapter', () => inspectPhone(customers[0]!.phone));