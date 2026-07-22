interface RunOptions<T> {
    readonly button: HTMLButtonElement;
    readonly output: HTMLElement;
    readonly label: string;
    readonly task: () => T | Promise<T>;
}

function stringify(value: unknown): string {
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
}

export function getRequired<T extends Element>(selector: string, parent: ParentNode = document): T {
    const element = parent.querySelector<T>(selector);
    if (!element) throw new Error(`Missing demo element: ${selector}`);
    return element;
}

export function showOutput(output: HTMLElement, value: unknown, state: 'success' | 'error'): void {
    output.dataset.state = state;
    output.textContent = stringify(value);
}

export async function runExample<T>({ button, output, label, task }: RunOptions<T>): Promise<void> {
    const originalLabel = button.textContent ?? 'Run example';
    button.disabled = true;
    button.textContent = 'Running...';
    output.dataset.state = 'running';
    output.textContent = 'Waiting for the simulated service...';
    console.group(`@sandlada/result | ${label}`);

    try {
        const result = await task();
        showOutput(output, result, 'success');
        console.log(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        showOutput(output, message, 'error');
        console.error(error);
    } finally {
        console.groupEnd();
        button.disabled = false;
        button.textContent = originalLabel;
    }
}

export function wireExample<T>(selector: string, label: string, task: () => T | Promise<T>): void {
    const root = getRequired<HTMLElement>(selector);
    const button = getRequired<HTMLButtonElement>('[data-run]', root);
    const output = getRequired<HTMLElement>('[data-output]', root);
    button.addEventListener('click', () => void runExample({ button, output, label, task }));
}