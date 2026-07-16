/**
 * @fileoverview Main entry — renders the demo UI, orchestrates scenario execution.
 *
 * Architecture:
 *   main.ts  →  renders HTML, handles user interactions
 *   scenarios.ts  →  4 scenario implementations using @sandlada/result
 *   scenario-runner.ts  →  types and helpers
 */

import { scenarios } from './scenarios.js';
import type { ScenarioResult } from './scenario-runner.js';
import { fmtMs } from './scenario-runner.js';

// ── State ──────────────────────────────────────────────────────────────

let activeId: string | null = null;
let isRunning = false;

// ── DOM refs ───────────────────────────────────────────────────────────

const $ = <T extends HTMLElement>(sel: string, parent?: ParentNode): T =>
    (parent ?? document).querySelector<T>(sel) ?? document.createElement('div') as T;

const nav = $('#scenario-nav');
const welcome = $('#welcome');
const resultArea = $('#result-area');
const resultTitle = $('#result-title');
const resultBadge = $('#result-status-badge');
const resultSteps = $('#result-steps');
const resultOutput = $('#result-output');
const resultCode = $('#result-code');
const loading = $('#loading');

// ── Render Sidebar ─────────────────────────────────────────────────────

function renderSidebar(): void {
    nav.innerHTML = '';
    for (const s of scenarios) {
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        btn.role = 'tab';
        btn.dataset.id = s.id;
        btn.innerHTML = `
            <span>${s.icon}</span>
            <span class="btn-label">${s.title}</span>
            <span class="status-dot idle"></span>
        `;
        btn.addEventListener('click', () => onScenarioSelect(s.id));
        nav.appendChild(btn);

        // Render controls if any
        if (s.controls) {
            const controlsEl = document.createElement('div');
            controlsEl.className = 'scenario-controls';
            controlsEl.id = `controls-${s.id}`;
            controlsEl.hidden = true;
            for (const ctrl of s.controls) {
                const row = document.createElement('div');
                row.className = 'control-row';
                row.innerHTML = `
                    <label for="input-${s.id}-${ctrl.key}">${ctrl.label}</label>
                    <input
                        id="input-${s.id}-${ctrl.key}"
                        type="${ctrl.type}"
                        value="${ctrl.defaultValue}"
                        min="1" max="10"
                    />
                `;
                controlsEl.appendChild(row);
            }
            // Run button
            const runBtn = document.createElement('button');
            runBtn.className = 'run-btn';
            runBtn.textContent = `▶ Run Scenario`;
            runBtn.addEventListener('click', () => runScenario(s.id));
            controlsEl.appendChild(runBtn);
            nav.appendChild(controlsEl);
        }
    }
}

// ── Scenario Selection ────────────────────────────────────────────────

function onScenarioSelect(id: string): void {
    if (isRunning) return;

    // Update active state
    activeId = id;
    document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector<HTMLElement>(`.scenario-btn[data-id="${id}"]`);
    btn?.classList.add('active');

    // Show controls if any, hide all others
    document.querySelectorAll('.scenario-controls').forEach(el => {
        (el as HTMLElement).hidden = el.id !== `controls-${id}`;
    });

    // Show welcome if no scenario selected yet
    // (First select always shows result-area after running)
    if (!document.querySelector('.scenario-btn.active')) {
        welcome.hidden = false;
        resultArea.hidden = true;
    }

    // Auto-run if no controls (scenarios 2, 3, 4)
    const scenario = scenarios.find(s => s.id === id);
    if (scenario && !scenario.controls) {
        runScenario(id);
    }
}

// ── Execute Scenario ───────────────────────────────────────────────────

async function runScenario(id: string): Promise<void> {
    if (isRunning) return;
    isRunning = true;

    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) { isRunning = false; return; }

    // Collect inputs
    const inputs: Record<string, string> = {};
    if (scenario.controls) {
        for (const ctrl of scenario.controls) {
            const el = document.querySelector<HTMLInputElement>(`#input-${id}-${ctrl.key}`);
            inputs[ctrl.key] = el?.value ?? ctrl.defaultValue;
        }
    }

    // Show loading
    welcome.hidden = true;
    resultArea.hidden = true;
    loading.hidden = false;

    try {
        const result = await scenario.run(inputs);
        renderResult(id, result);
    } catch (e: unknown) {
        renderResult(id, {
            status: 'failure',
            duration: 0,
            title: scenario.title,
            output: `💥 Unexpected error: ${e instanceof Error ? e.message : String(e)}`,
            outputType: 'text',
            code: '',
            steps: [],
            stepsCode: [],
        });
    } finally {
        loading.hidden = true;
        resultArea.hidden = false;
        isRunning = false;
    }
}

// ── Render Result ──────────────────────────────────────────────────────

function renderResult(id: string, result: ScenarioResult): void {
    // Update sidebar dot
    document.querySelectorAll('.scenario-btn .status-dot').forEach(d => d.className = 'status-dot idle');
    const dot = document.querySelector<HTMLElement>(`.scenario-btn[data-id="${id}"] .status-dot`);
    if (dot) dot.className = `status-dot ${result.status}`;

    // Header
    resultTitle.textContent = result.title;
    resultBadge.textContent = `${result.status === 'success' ? '✅' : '❌'} ${result.status.toUpperCase()} · ${fmtMs(result.duration)}`;
    resultBadge.className = result.status;

    // Steps timeline
    resultSteps.innerHTML = '';
    for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i]!;
        const stepEl = document.createElement('div');
        stepEl.className = `step-item ${step.status}`;

        const icon = step.status === 'success' ? '✓' : step.status === 'failure' ? '✗' : '−';
        stepEl.innerHTML = `
            <span class="step-icon">${icon}</span>
            <span class="step-name">${step.name}</span>
            ${step.detail ? `<span class="step-detail">${escHtml(step.detail)}</span>` : ''}
            <span class="step-duration">${fmtMs(step.duration)}</span>
        `;
        resultSteps.appendChild(stepEl);
    }

    // Output
    resultOutput.innerHTML = '';

    // Card layout
    if (result.outputType === 'card') {
        const lines = result.output.split('\n');
        let cardHtml = '';

        // Detect section headers (all-caps lines)
        const isSectionHeader = (s: string) => /^[A-Z\s]{5,}$/.test(s.trim());

        for (const line of lines) {
            if (!line.trim()) {
                cardHtml += '<br />';
            } else if (isSectionHeader(line)) {
                cardHtml += `<div class="card-section-header">${escHtml(line)}</div>`;
            } else if (line.startsWith('✅') || line.startsWith('❌')) {
                cardHtml += `<div class="card-row card-status">${escHtml(line)}</div>`;
            } else if (line.startsWith('════')) {
                cardHtml += '<hr class="card-divider" />';
            } else {
                cardHtml += `<div class="card-row"><span class="card-value">${escHtml(line)}</span></div>`;
            }
        }

        if (lines.length <= 2) {
            resultOutput.innerHTML = `<span class="output-label">Result</span><div class="output-json">${escHtml(result.output)}</div>`;
        } else {
            resultOutput.innerHTML = `<div class="output-card">${cardHtml}</div>`;
        }
    } else if (result.outputType === 'json') {
        resultOutput.innerHTML = `<span class="output-label">Result</span><div class="output-json">${escHtml(result.output)}</div>`;
    } else {
        resultOutput.innerHTML = `<span class="output-label">Result</span>${escHtml(result.output)}`;
    }

    // Code snippet
    if (result.code) {
        resultCode.innerHTML = `
            <div class="code-header"><span>@sandlada/result</span><span>TypeScript</span></div>
            <pre>${escHtml(result.code)}</pre>
        `;
        resultCode.hidden = false;
    } else {
        resultCode.hidden = true;
    }
}

// ── Escaping ───────────────────────────────────────────────────────────

function escHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Init ───────────────────────────────────────────────────────────────

renderSidebar();

// Auto-select first scenario
if (scenarios.length > 0) {
    onScenarioSelect(scenarios[0]!.id);
}
