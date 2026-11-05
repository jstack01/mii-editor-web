import './style.css';
import { MiiCharacterData } from './model/MiiCharacterData';
import { DEFAULT_MII_HEX } from './generated/default-character';
import { buildHeadScene } from './render/headScene';
import { renderHeadSvg } from './render/svgRenderer';

function element<T extends HTMLElement>(id: string, type: { new (): T }): T {
  const found = document.getElementById(id);
  if (!(found instanceof type)) throw new Error(`Missing ${id}`);
  return found;
}

const input = element('name', HTMLInputElement);
const hex = element('hex', HTMLTextAreaElement);
const decoded = element('decoded', HTMLOutputElement);
const status = element('status', HTMLParagraphElement);
const stage = element('stage', HTMLElement);
const viewport = element('viewport', HTMLElement);
let character = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
const originalBytes = character.toBytes();
const preview = element('character-preview', HTMLDivElement);
const renderError = element('render-error', HTMLParagraphElement);
let showDiagnostics = import.meta.env.DEV && new URLSearchParams(location.search).get('diagnostics') === '1';
if (import.meta.env.DEV) {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox'; checkbox.checked = showDiagnostics;
  label.append(checkbox, ' Alignment diagnostics (development)');
  element('render-diagnostics', HTMLDivElement).append(label);
  checkbox.addEventListener('change', () => { showDiagnostics = checkbox.checked; render(); });
}

function render(): void {
  hex.value = character.toHex();
  decoded.value = character.name || '(empty)';
  const current = character.toBytes();
  const intact = current.every((byte, index) => (index >= 2 && index < 22) || byte === originalBytes[index]);
  if (!intact) throw new Error('Name edit changed unrelated data.');
  status.textContent = 'All 54 unrelated bytes preserved.';
  try {
    const scene = buildHeadScene(character);
    preview.replaceChildren(renderHeadSvg(scene, {diagnostics: showDiagnostics}));
    renderError.hidden = true;
  } catch (error) {
    preview.replaceChildren();
    renderError.textContent = error instanceof Error ? error.message : String(error);
    renderError.hidden = false;
  }
}

function commitName(): void {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.value = input.value.slice(0, 10);
  character.name = input.value;
  if (start !== null && end !== null) input.setSelectionRange(Math.min(start, 10), Math.min(end, 10));
  render();
}

input.addEventListener('input', (event) => {
  if (!(event instanceof InputEvent) || !event.isComposing) commitName();
});
input.addEventListener('compositionend', commitName);
element('reset', HTMLButtonElement).addEventListener('click', () => {
  character = MiiCharacterData.fromHex(DEFAULT_MII_HEX);
  input.value = character.name;
  render();
  input.focus();
});
new ResizeObserver(() => {
  stage.style.setProperty('--stage-scale', String(viewport.clientWidth / 640));
}).observe(viewport);
input.value = character.name;
render();
