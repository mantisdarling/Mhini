import React, { useEffect, useRef } from "react";

type ConnectionHints = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

const vertexSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;

  float line(float value, float width) {
    return 1.0 - smoothstep(width, width + 0.012, abs(value));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 pointer = u_pointer / u_resolution.xy;
    float sweep = fract(u_time * 0.035);
    float diagonal = line(uv.y - (0.78 - uv.x * 0.32), 0.0025);
    float telemetry = line(uv.x - sweep, 0.0015) * 0.5;
    float pulse = exp(-18.0 * distance(uv, pointer)) * 0.34;
    float ink = smoothstep(0.52, 0.0, distance(uv, vec2(0.72, 0.42))) * 0.08;
    float signal = min(1.0, diagonal + telemetry + pulse + ink);
    vec3 red = vec3(0.78, 0.04, 0.09);
    vec3 paper = vec3(0.91, 0.9, 0.84);
    vec3 color = mix(red, paper, clamp(uv.y * 0.4, 0.0, 1.0));
    gl_FragColor = vec4(color, signal * 0.22);
  }
`;

function shouldUseFallback() {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return true;
  const connection = (navigator as ConnectionHints).connection;
  if (
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  )
    return true;
  if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)
    return true;
  if (window.matchMedia?.("(pointer: coarse)").matches) return true;
  return false;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroTelemetryField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || shouldUseFallback()) {
      canvas?.setAttribute("data-visual-state", "fallback");
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        premultipliedAlpha: true,
      });
    } catch {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }
    if (!gl) {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentSource
    );
    if (!vertexShader || !fragmentShader) {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }

    const buffer = gl.createBuffer();
    const position = gl.getAttribLocation(program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const time = gl.getUniformLocation(program, "u_time");
    if (!buffer || position < 0 || !resolution || !pointer || !time) {
      canvas.setAttribute("data-visual-state", "fallback");
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    canvas.setAttribute("data-visual-state", "active");

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let width = 1;
    let height = 1;
    const startedAt = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = Math.max(1, Math.round(rect.width * pixelRatio));
      height = Math.max(1, Math.round(rect.height * pixelRatio));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = rect.height - (event.clientY - rect.top);
    };

    const render = (now: number) => {
      gl.useProgram(program);
      gl.uniform2f(resolution, width, height);
      gl.uniform2f(pointer, pointerX, pointerY);
      gl.uniform1f(time, (now - startedAt) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-telemetry-field"
      aria-hidden="true"
      data-visual-state="checking"
    />
  );
}
