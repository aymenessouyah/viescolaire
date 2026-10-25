const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const signatureWindow = { devicePixelRatio: 2 };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'assets/signature-canvas.js'), 'utf8'),
  { window: signatureWindow },
  { filename: 'assets/signature-canvas.js' }
);
const signature = signatureWindow.STI_SIGNATURE;

function local(value) { return JSON.parse(JSON.stringify(value)); }

test('sérialise une signature vectorielle compacte et la relit sans accepter du texte arbitraire', () => {
  const saved = signature.serialize([[[0.1, 0.2], [0.45, 0.78], [0.9, 0.3]]]);
  assert.match(saved, /^sti-canvas-v1:/);
  assert.deepEqual(local(signature.parse(saved)), [[[0.1, 0.2], [0.45, 0.78], [0.9, 0.3]]]);
  assert.equal(signature.parse('ancienne signature tapée').length, 0);
  assert.equal(signature.parse('sti-canvas-v1:{invalid').length, 0);
  assert.equal(signature.isValid(saved), true);
  assert.equal(signature.isValid('texte libre'), false);
});

test('le rendu SVG ne contient que les points validés du canevas', () => {
  const saved = signature.serialize([[[0, 0.5], [0.5, 0.1], [1, 0.8]]]);
  const markup = signature.toMarkup(saved);
  assert.match(markup, /<svg class="teacher-signature-ink"/);
  assert.match(markup, /<path d="M0\.00 140\.63 L500\.00 28\.13 L1000\.00 225\.00"/);
  assert.doesNotMatch(signature.toMarkup('<svg onload=alert(1)>'), /onload|alert/);
  assert.equal(signature.toMarkup(''), '');
});

test('le canevas capte les pointeurs tactiles/souris et permet annuler ou effacer', () => {
  const events = {};
  const context = {
    setTransform() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {},
    moveTo() {}, lineTo() {}, stroke() {}
  };
  const canvas = {
    width: 0, height: 0, style: {},
    addEventListener(name, callback) { events[name] = callback; },
    getContext() { return context; },
    getBoundingClientRect() { return { left: 10, top: 20, width: 640, height: 180 }; },
    setPointerCapture() {}
  };
  signature.attach(canvas, '');
  const event = (clientX, clientY, pointerId) => ({
    clientX, clientY, pointerId, button: 0, isPrimary: true, preventDefault() {}
  });
  events.pointerdown(event(74, 74, 1));
  events.pointermove(event(330, 92, 1));
  events.pointerup(event(330, 92, 1));
  let strokes = local(signature.parse(signature.value(canvas)));
  assert.equal(strokes.length, 1);
  assert.deepEqual(strokes[0][0], [0.1, 0.3]);
  assert.deepEqual(strokes[0][1], [0.5, 0.4]);

  events.pointerdown(event(100, 80, 2));
  events.pointerup(event(100, 80, 2));
  signature.undo(canvas);
  assert.equal(signature.parse(signature.value(canvas)).length, 1);
  signature.clear(canvas);
  assert.equal(signature.value(canvas), '');
});
