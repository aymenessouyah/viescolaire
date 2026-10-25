/* Signature manuscrite vectorielle : dessin au pointeur, stockage compact et rendu sûr. */
(function (root) {
  "use strict";

  const PREFIX = "sti-canvas-v1:";
  const WIDTH = 640, HEIGHT = 180, SVG_WIDTH = 1000, SVG_HEIGHT = 281.25;
  const MAX_STROKES = 32, MAX_POINTS = 3000, MAX_POINTS_PER_STROKE = 600;
  const states = new WeakMap();

  function clamp(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000;
  }

  function cleanStrokes(strokes) {
    if (!Array.isArray(strokes)) return [];
    let total = 0;
    const cleaned = [];
    strokes.slice(-MAX_STROKES).forEach(function (stroke) {
      if (!Array.isArray(stroke) || total >= MAX_POINTS) return;
      const points = [];
      stroke.slice(0, MAX_POINTS_PER_STROKE).forEach(function (point) {
        if (!Array.isArray(point) || point.length < 2 || total >= MAX_POINTS) return;
        const x = clamp(point[0]), y = clamp(point[1]);
        if (x === null || y === null) return;
        const prev = points[points.length - 1];
        if (prev && prev[0] === x && prev[1] === y) return;
        points.push([x, y]);
        total++;
      });
      if (points.length) cleaned.push(points);
    });
    return cleaned;
  }

  function parse(value) {
    const raw = String(value || "");
    if (!raw.startsWith(PREFIX)) return [];
    try { return cleanStrokes(JSON.parse(raw.slice(PREFIX.length))); }
    catch (error) { return []; }
  }

  function serialize(strokes) {
    const clean = cleanStrokes(strokes);
    return clean.length ? PREFIX + JSON.stringify(clean) : "";
  }

  function isValid(value) {
    const raw = String(value || "");
    return !raw || (raw.startsWith(PREFIX) && parse(raw).length > 0);
  }

  function toMarkup(value) {
    const strokes = parse(value);
    if (!strokes.length) return "";
    const shapes = strokes.map(function (stroke) {
      if (stroke.length === 1) {
        const x = (stroke[0][0] * SVG_WIDTH).toFixed(2);
        const y = (stroke[0][1] * SVG_HEIGHT).toFixed(2);
        return '<circle cx="' + x + '" cy="' + y + '" r="4.2" />';
      }
      const d = stroke.map(function (point, index) {
        const x = (point[0] * SVG_WIDTH).toFixed(2);
        const y = (point[1] * SVG_HEIGHT).toFixed(2);
        return (index ? "L" : "M") + x + " " + y;
      }).join(" ");
      return '<path d="' + d + '" />';
    }).join("");
    return '<svg class="teacher-signature-ink" viewBox="0 0 ' + SVG_WIDTH + ' ' + SVG_HEIGHT +
      '" role="img" aria-label="Signature manuscrite du professeur" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="#17382e" stroke="#17382e" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">' +
      shapes + '</g></svg>';
  }

  function canvasFrom(value) {
    if (typeof value === "string") return root.document && root.document.getElementById(value);
    return value || null;
  }

  function pointFromEvent(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || WIDTH, height = rect.height || HEIGHT;
    return [
      clamp((event.clientX - rect.left) / width),
      clamp((event.clientY - rect.top) / height)
    ];
  }

  function pointDistance(a, b) {
    const dx = (a[0] - b[0]) * WIDTH, dy = (a[1] - b[1]) * HEIGHT;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function resize(canvas, state) {
    const dpr = Math.min(3, Math.max(1, Number(root.devicePixelRatio) || 1));
    canvas.width = Math.round(WIDTH * dpr);
    canvas.height = Math.round(HEIGHT * dpr);
    state.dpr = dpr;
    if (canvas.style) canvas.style.touchAction = "none";
  }

  function draw(canvas, state) {
    const context = canvas.getContext && canvas.getContext("2d");
    if (!context) return;
    const dpr = state.dpr || 1;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.lineWidth = 2.8;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#17382e";
    context.fillStyle = "#17382e";
    state.strokes.forEach(function (stroke) {
      if (!stroke.length) return;
      if (stroke.length === 1) {
        context.beginPath();
        context.arc(stroke[0][0] * WIDTH, stroke[0][1] * HEIGHT, 1.6, 0, Math.PI * 2);
        context.fill();
        return;
      }
      context.beginPath();
      context.moveTo(stroke[0][0] * WIDTH, stroke[0][1] * HEIGHT);
      stroke.slice(1).forEach(function (point) { context.lineTo(point[0] * WIDTH, point[1] * HEIGHT); });
      context.stroke();
    });
  }

  function attach(canvasLike, value) {
    const canvas = canvasFrom(canvasLike);
    if (!canvas) return null;
    let state = states.get(canvas);
    if (!state) {
      state = { strokes: [], active: null, pointerId: null, dpr: 1 };
      states.set(canvas, state);
      canvas.addEventListener("pointerdown", function (event) {
        if (event.isPrimary === false || (event.button != null && event.button !== 0)) return;
        if (event.preventDefault) event.preventDefault();
        const stroke = [pointFromEvent(canvas, event)];
        state.strokes.push(stroke);
        if (state.strokes.length > MAX_STROKES) state.strokes.shift();
        state.active = stroke;
        state.pointerId = event.pointerId;
        if (canvas.setPointerCapture && event.pointerId != null) {
          try { canvas.setPointerCapture(event.pointerId); } catch (error) {}
        }
        draw(canvas, state);
      });
      canvas.addEventListener("pointermove", function (event) {
        if (!state.active || (state.pointerId != null && event.pointerId !== state.pointerId)) return;
        if (event.preventDefault) event.preventDefault();
        const point = pointFromEvent(canvas, event), last = state.active[state.active.length - 1];
        if (pointDistance(point, last) < 1.2) return;
        const total = state.strokes.reduce(function (sum, stroke) { return sum + stroke.length; }, 0);
        if (state.active.length < MAX_POINTS_PER_STROKE && total < MAX_POINTS) {
          state.active.push(point);
          draw(canvas, state);
        }
      });
      const finish = function (event) {
        if (!state.active || (state.pointerId != null && event.pointerId !== state.pointerId)) return;
        state.active = null;
        state.pointerId = null;
        draw(canvas, state);
      };
      canvas.addEventListener("pointerup", finish);
      canvas.addEventListener("pointercancel", finish);
      canvas.addEventListener("lostpointercapture", finish);
    }
    state.strokes = parse(value);
    state.active = null;
    state.pointerId = null;
    resize(canvas, state);
    draw(canvas, state);
    return canvas;
  }

  function value(canvasLike) {
    const canvas = canvasFrom(canvasLike);
    const state = canvas && states.get(canvas);
    return state ? serialize(state.strokes) : "";
  }

  function clear(canvasLike) {
    const canvas = canvasFrom(canvasLike), state = canvas && states.get(canvas);
    if (!state) return;
    state.strokes = [];
    state.active = null;
    state.pointerId = null;
    draw(canvas, state);
  }

  function undo(canvasLike) {
    const canvas = canvasFrom(canvasLike), state = canvas && states.get(canvas);
    if (!state) return;
    state.active = null;
    state.pointerId = null;
    state.strokes.pop();
    draw(canvas, state);
  }

  root.STI_SIGNATURE = {
    prefix: PREFIX,
    parse: parse,
    serialize: serialize,
    isValid: isValid,
    toMarkup: toMarkup,
    attach: attach,
    value: value,
    clear: clear,
    undo: undo
  };
})(typeof window !== "undefined" ? window : globalThis);
