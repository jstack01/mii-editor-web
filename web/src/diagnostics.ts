import './style.css';
import { MiiCharacterData } from './model/MiiCharacterData';
import { DEFAULT_MII_HEX } from './generated/default-character';
import { MII_FIELDS, MII_VALUE_NAMES } from './generated/mii-schema';
import { RENDER_CASES } from './generated/render-cases';
import { buildCharacterScene, buildHeadScene } from './render/headScene';
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
const parameters = new URLSearchParams(location.search);
const initialCase = RENDER_CASES.find((item) => item.id === parameters.get('case')) ?? RENDER_CASES[0]!;
let character = MiiCharacterData.fromHex(initialCase.hex);
let nameBaseline = character.toBytes();
const view = element('render-view', HTMLSelectElement);
view.value = parameters.get('view') === 'head' ? 'head' : 'full';
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
  const intact = current.every((byte, index) => (index >= 2 && index < 22) || byte === nameBaseline[index]);
  if (!intact) throw new Error('Name edit changed unrelated data.');
  status.textContent = 'All 54 unrelated bytes preserved.';
  try {
    preview.dataset.view = view.value;
    const scene = view.value === 'head' ? buildHeadScene(character) : buildCharacterScene(character);
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
  nameBaseline = character.toBytes();
  preset.value = 'default';
  updateField();
  input.value = character.name;
  render();
  input.focus();
});
const preset = element('character-preset', HTMLSelectElement);
for (const item of RENDER_CASES) { const option=document.createElement('option'); option.value=item.id; option.textContent=item.label; preset.append(option); }
preset.value=initialCase.id;
const field=element('render-field',HTMLSelectElement);
for (const name of MII_VALUE_NAMES) {const option=document.createElement('option');option.value=name;option.textContent=name;field.append(option);}
field.value='height';
const valueInput=element('render-value',HTMLInputElement);
function updateField():void {
  const name=field.value as keyof typeof MII_FIELDS;const definition=MII_FIELDS[name];
  valueInput.min=String(definition.min);valueInput.max=String(definition.max);valueInput.value=String(character.getValue(name));
  element('field-help',HTMLParagraphElement).textContent=`${name}: ${definition.min}–${definition.max}, original packed values. Changes update the character and its serialized data.`;
}
field.addEventListener('change',updateField);
preset.addEventListener('change',()=>{const chosen=RENDER_CASES.find((item)=>item.id===preset.value);if(!chosen)return;character=MiiCharacterData.fromHex(chosen.hex);nameBaseline=character.toBytes();input.value=character.name;updateField();render();});
element('apply-attribute',HTMLButtonElement).addEventListener('click',()=>{character.setValue(field.value,Number(valueInput.value));nameBaseline=character.toBytes();updateField();render();});
view.addEventListener('change',render);
updateField();
new ResizeObserver(() => {
  stage.style.setProperty('--stage-scale', String(viewport.clientWidth / 640));
}).observe(viewport);
input.value = character.name;
render();
