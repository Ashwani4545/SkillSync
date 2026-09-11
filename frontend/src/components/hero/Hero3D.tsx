"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A self-contained, dependency-light 3D visual for the landing page hero.
 * Uses vanilla three.js rather than @react-three/fiber — one fewer package
 * to version-match against React 18, and this scene is simple enough
 * (one mesh + a particle field) that the extra abstraction isn't worth it.
 *
 * Respects prefers-reduced-motion (stops the rotation loop, keeps a static
 * frame) and cleans up its renderer/geometry on unmount so navigating away
 * from the landing page doesn't leak a WebGL context.
 */
export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Central shape: a wireframe icosahedron, standing in for
    // "many facets being checked at once" (ATS / recruiter / hiring
    // manager) — fits the product's actual pitch instead of being
    // decoration for its own sake.
    const coreGeometry = new THREE.IcosahedronGeometry(2, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x0f6e56,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // A second, slightly larger, faint shell for depth
    const shellGeometry = new THREE.IcosahedronGeometry(2.6, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x378add,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(shell);

    // ── Floating particle field behind the shape
    const particleCount = 140;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x1d9e75,
      size: 0.045,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let frameId: number;
    let elapsed = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!prefersReducedMotion) {
        elapsed += 0.005;
        core.rotation.x = elapsed * 0.6;
        core.rotation.y = elapsed;
        shell.rotation.x = -elapsed * 0.3;
        shell.rotation.y = -elapsed * 0.5;
        particles.rotation.y = elapsed * 0.08;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      coreGeometry.dispose();
      coreMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        width: "100%",
        height: 340,
        maxWidth: 560,
        margin: "0 auto",
        cursor: "grab",
      }}
    />
  );
}
