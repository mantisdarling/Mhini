import { useEffect, useRef } from "react";
import * as THREE from "three";

export function MantisKatanaScene({ onReady }: { onReady?: (state: "ready" | "fallback") => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { readyRef.current?.("fallback"); return; }
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "katana-canvas";
    host.appendChild(canvas);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" }); } catch { readyRef.current?.("fallback"); host.removeChild(canvas); return; }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
    readyRef.current?.("ready");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse || lowPower ? 1 : 1.35));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0.5, 0.25, 6.4);
    const group = new THREE.Group();
    group.rotation.set(-0.3, 0.38, -0.18);
    scene.add(group);
    const steel = new THREE.MeshStandardMaterial({ color: 0xe7e3d9, metalness: 0.92, roughness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.35, roughness: 0.66 });
    const red = new THREE.MeshStandardMaterial({ color: 0xc81e1e, metalness: 0.2, roughness: 0.5 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 0.04), steel);
    blade.position.y = 0.25;
    group.add(blade);
    const guard = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.055, 8, 32), red);
    guard.rotation.x = Math.PI / 2;
    guard.position.y = -1.95;
    group.add(guard);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.7, 12), dark);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, -2.78, 0);
    group.add(handle);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), red);
    cap.position.set(0, -3.63, 0);
    group.add(cap);
    scene.add(new THREE.AmbientLight(0xf2efe9, 1.45));
    const key = new THREE.DirectionalLight(0xd4af37, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc81e1e, 1.4);
    fill.position.set(-4, -1, 2);
    scene.add(fill);
    let frame = 0; let visible = true; let last = 0; let scrollTarget = 0; let scrollValue = 0;
    const resize = () => { const width = Math.max(1, host.clientWidth); const height = Math.max(1, host.clientHeight); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
    const onScroll = () => { scrollTarget = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))); };
    const draw = (now: number) => { if (!visible || document.hidden) { frame = 0; return; } const interval = coarse || lowPower ? 1000 / 30 : 1000 / 60; if (now - last < interval) { frame = requestAnimationFrame(draw); return; } last = now; scrollValue += (scrollTarget - scrollValue) * 0.06; group.rotation.y = 0.38 + scrollValue * 2.2; group.rotation.x = -0.3 + scrollValue * 0.65; group.position.y = (scrollValue - 0.5) * 0.7; camera.position.z = 6.4 - scrollValue * 0.8; camera.lookAt(0, -0.8, 0); renderer.render(scene, camera); frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); if (visible && !frame) frame = requestAnimationFrame(draw); }); observer.observe(host);
    const onVisibility = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw); };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host); window.addEventListener("scroll", onScroll, { passive: true }); document.addEventListener("visibilitychange", onVisibility); resize(); onScroll(); frame = requestAnimationFrame(draw);
    return () => { if (frame) cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect(); window.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onVisibility); scene.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose()); else if (mesh.material) mesh.material.dispose(); }); renderer.dispose(); host.removeChild(canvas); };
  }, []);
  return <div ref={hostRef} className="katana-scene" aria-label="Interactive Mantis katana study"><div className="katana-fallback" aria-hidden="true" /></div>;
}
