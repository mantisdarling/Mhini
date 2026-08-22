import { useEffect, useRef } from "react";

const vertex = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const fragment = `precision mediump float;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uPointer;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() { vec2 uv = gl_FragCoord.xy / uResolution.xy; vec2 p = uv - 0.5; p.x *= uResolution.x / uResolution.y; float t = uTime * 0.08; vec2 pointer = uPointer - 0.5; pointer.x *= uResolution.x / uResolution.y; float blade = exp(-abs(p.y - (p.x * 0.62 + 0.08 * sin(t))) * 34.0); float cloud = noise(p * 3.2 + vec2(t, -t * 0.7)) * 0.45 + noise(p * 7.0 - t) * 0.22; float cut = exp(-length(p - pointer * 0.7) * 7.0) * 0.4; float red = blade * 0.42 + cut + cloud * 0.06; vec3 ink = vec3(0.015, 0.012, 0.012) + vec3(0.55, 0.01, 0.035) * red; ink += vec3(0.08, 0.055, 0.015) * blade * 0.25; float vignette = smoothstep(0.95, 0.15, length(p)); gl_FragColor = vec4(ink * vignette, 1.0); }`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source); gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function MantisFluidField({ onReady }: { onReady?: (state: "ready" | "fallback") => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { readyRef.current?.("fallback"); return; }
    let cleanup: (() => void) | undefined;
    const boot = () => {
      const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
      if (!gl) { canvas.classList.add("is-fallback"); readyRef.current?.("fallback"); return; }
      const program = gl.createProgram(); const vs = compile(gl, gl.VERTEX_SHADER, vertex); const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
      if (!program || !vs || !fs) { canvas.classList.add("is-fallback"); readyRef.current?.("fallback"); return; }
      gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.classList.add("is-fallback"); readyRef.current?.("fallback"); return; }
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position"); const time = gl.getUniformLocation(program, "uTime"); const resolution = gl.getUniformLocation(program, "uResolution"); const pointer = gl.getUniformLocation(program, "uPointer");
      const point = { x: 0.5, y: 0.5 }; let frame = 0; let visible = true; let last = 0;
      const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, window.matchMedia("(pointer: coarse)").matches ? 1 : 1.5); canvas.width = Math.max(1, Math.floor(innerWidth * dpr)); canvas.height = Math.max(1, Math.floor(innerHeight * dpr)); gl.viewport(0, 0, canvas.width, canvas.height); };
      const move = (event: PointerEvent) => { if (event.pointerType !== "mouse") return; point.x = event.clientX / innerWidth; point.y = 1 - event.clientY / innerHeight; };
      const draw = (now: number) => { if (!visible || document.hidden) { frame = 0; return; } if (now - last < 16) { frame = requestAnimationFrame(draw); return; } last = now; gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0); gl.uniform1f(time, now * 0.001); gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform2f(pointer, point.x, point.y); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); frame = requestAnimationFrame(draw); };
      const onVisibility = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw); };
      const observer = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); if (visible && !frame) frame = requestAnimationFrame(draw); }); observer.observe(canvas);
      readyRef.current?.("ready");
      resize(); window.addEventListener("resize", resize, { passive: true }); window.addEventListener("pointermove", move, { passive: true }); document.addEventListener("visibilitychange", onVisibility); frame = requestAnimationFrame(draw);
      cleanup = () => { if (frame) cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); document.removeEventListener("visibilitychange", onVisibility); gl.deleteBuffer(buffer); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteProgram(program); };
    };
    if (document.readyState === "complete") boot(); else window.addEventListener("load", boot, { once: true });
    return () => { window.removeEventListener("load", boot); cleanup?.(); };
  }, []);
  return <canvas ref={canvasRef} className="mantis-fluid-field" aria-hidden="true" />;
}
