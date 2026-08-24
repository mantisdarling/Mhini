import React, { useEffect, useRef, useState } from "react";

type ConnectionHints = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

type VisualState = "checking" | "active" | "fallback";

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
    float sweep = fract(u_time * 0.018);
    float diagonal = line(uv.y - (0.78 - uv.x * 0.32), 0.0020) * 0.34;
    float telemetry = line(uv.x - sweep, 0.0012) * 0.16;
    float wake = exp(-42.0 * distance(uv, pointer)) * 0.18;
    float ink = smoothstep(0.58, 0.0, distance(uv, vec2(0.72, 0.42))) * 0.035;
    float signal = min(1.0, diagonal + telemetry + wake + ink);
    vec3 red = vec3(0.78, 0.04, 0.09);
    vec3 paper = vec3(0.91, 0.9, 0.84);
    vec3 color = mix(red, paper, clamp(uv.y * 0.4, 0.0, 1.0));
    gl_FragColor = vec4(color, signal * 0.16);
  }
`;

function reducedMotionPreference() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function shouldUseFallback(reducedMotion: boolean) {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return true;
  if (reducedMotion) return true;
  const connection = (navigator as ConnectionHints).connection;
  if (
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  )
    return true;
  if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)
    return true;
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
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
  const fpsReadoutRef = useRef<HTMLOutputElement>(null);
  const [reducedMotion, setReducedMotion] = useState(reducedMotionPreference);
  const [visualState, setVisualState] = useState<VisualState>("checking");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    query.addEventListener?.("change", updatePreference);
    return () => query.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || shouldUseFallback(reducedMotion)) {
      setVisualState("fallback");
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      setVisualState("fallback");
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
      setVisualState("fallback");
      return;
    }
    if (!gl) {
      setVisualState("fallback");
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentSource
    );
    if (!vertexShader || !fragmentShader) {
      setVisualState("fallback");
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setVisualState("fallback");
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setVisualState("fallback");
      return;
    }

    const buffer = gl.createBuffer();
    const position = gl.getAttribLocation(program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const time = gl.getUniformLocation(program, "u_time");
    if (!buffer || position < 0 || !resolution || !pointer || !time) {
      setVisualState("fallback");
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
    setVisualState("active");

    let frame = 0;
    let width = 1;
    let height = 1;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let lastFrameAt = performance.now();
    let frameCount = 0;
    let fpsWindowStartedAt = lastFrameAt;
    const startedAt = lastFrameAt;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = Math.max(1, Math.round(rect.width * pixelRatio));
      height = Math.max(1, Math.round(rect.height * pixelRatio));
      canvas.width = width;
      canvas.height = height;
      pointerX = width * 0.66;
      pointerY = height * 0.46;
      targetPointerX = pointerX;
      targetPointerY = pointerY;
      gl.viewport(0, 0, width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetPointerX = ((event.clientX - rect.left) / rect.width) * width;
      targetPointerY = ((rect.bottom - event.clientY) / rect.height) * height;
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      setVisualState("fallback");
      cancelAnimationFrame(frame);
    };

    const render = (now: number) => {
      pointerX += (targetPointerX - pointerX) * 0.055;
      pointerY += (targetPointerY - pointerY) * 0.055;
      gl.useProgram(program);
      gl.uniform2f(resolution, width, height);
      gl.uniform2f(pointer, pointerX, pointerY);
      gl.uniform1f(time, (now - startedAt) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameCount += 1;
      if (now - fpsWindowStartedAt >= 1000 && fpsReadoutRef.current) {
        const fps = Math.round(
          (frameCount * 1000) / (now - fpsWindowStartedAt)
        );
        fpsReadoutRef.current.textContent = `WEBGL · ${fps} FPS`;
        frameCount = 0;
        fpsWindowStartedAt = now;
      }
      lastFrameAt = now;
      frame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("webglcontextlost", onContextLost);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [reducedMotion]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="hero-telemetry-field"
        aria-hidden="true"
        data-visual-state={visualState}
      />
      {import.meta.env.DEV && (
        <output
          ref={fpsReadoutRef}
          className="hero-telemetry-readout"
          aria-label="WebGL frame rate"
          aria-live="off"
        >
          WEBGL · -- FPS
        </output>
      )}
    </>
  );
}
