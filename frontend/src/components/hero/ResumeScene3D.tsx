"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type ReviewerId = "ats" | "recruiter" | "hiring_manager";

interface ResumeScene3DProps {
  activeReviewer: ReviewerId;
  onSelectReviewer?: (id: ReviewerId) => void;
  className?: string;
}

interface ReviewerConfig {
  id: ReviewerId;
  label: string;
  badge: string;
  color: number;
  hexColor: string;
  stopLineY: number; // relative Y position on the page texture
  stopText: string;
  score: number;
}

const REVIEWERS: Record<ReviewerId, ReviewerConfig> = {
  ats: {
    id: "ats",
    label: "ATS Bot",
    badge: "LAYER 1",
    color: 0x1d9e75,
    hexColor: "#1D9E75",
    stopLineY: 0.28, // Top-middle
    stopText: "Line 4: Keyword density fail",
    score: 61,
  },
  recruiter: {
    id: "recruiter",
    label: "HR Recruiter",
    badge: "LAYER 2",
    color: 0x38bdf8,
    hexColor: "#38BDF8",
    stopLineY: -0.05, // Middle
    stopText: "Line 11: 7-month gap unexplained",
    score: 54,
  },
  hiring_manager: {
    id: "hiring_manager",
    label: "Hiring Manager",
    badge: "LAYER 3",
    color: 0xa855f7,
    hexColor: "#A855F7",
    stopLineY: -0.38, // Lower section
    stopText: "Line 18: Zero quantifiable impact",
    score: 48,
  },
};

export function ResumeScene3D({
  activeReviewer,
  onSelectReviewer,
  className = "",
}: ResumeScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeReviewerRef = useRef(activeReviewer);
  activeReviewerRef.current = activeReviewer;

  const [hoveredReviewer, setHoveredReviewer] = useState<ReviewerId | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x1d9e75, 2.0, 10);
    pointLight.position.set(-2, 1, 4);
    scene.add(pointLight);

    // Helper to generate realistic canvas textures for resume pages
    const createResumeTexture = (config: ReviewerConfig) => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 850;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Paper background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = config.hexColor;
      ctx.fillRect(0, 0, canvas.width, 100);

      // Header text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`SKILLSYNC AUDIT: ${config.label.toUpperCase()}`, 36, 46);

      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`${config.badge} — SCORE: ${config.score}/100`, 36, 76);

      // Candidate Fake Header
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("ALEX MORGAN", 36, 150);

      ctx.fillStyle = "#64748B";
      ctx.font = "14px sans-serif";
      ctx.fillText("Senior Full Stack Software Engineer | React, TypeScript, Node.js", 36, 175);
      ctx.fillText("alex.morgan@email.com • github.com/alexmorgan • linkedin.com/in/alexmorgan", 36, 195);

      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(36, 215);
      ctx.lineTo(564, 215);
      ctx.stroke();

      // Section 1: Summary
      ctx.fillStyle = config.hexColor;
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("PROFESSIONAL SUMMARY", 36, 245);

      ctx.fillStyle = "#475569";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(36, 260 + i * 16, i === 2 ? 380 : 520, 6);
      }

      // Section 2: Experience
      ctx.fillStyle = config.hexColor;
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("WORK EXPERIENCE", 36, 340);

      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Lead Frontend Engineer — CloudTech Systems", 36, 368);

      ctx.fillStyle = "#475569";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(52, 385 + i * 20, i % 2 === 0 ? 500 : 440, 5);
        ctx.fillStyle = config.hexColor;
        ctx.beginPath();
        ctx.arc(42, 387 + i * 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#475569";
      }

      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Senior Software Developer — NexaSoft Labs", 36, 490);

      for (let i = 0; i < 4; i++) {
        ctx.fillRect(52, 508 + i * 20, i % 2 === 0 ? 490 : 420, 5);
        ctx.fillStyle = config.hexColor;
        ctx.beginPath();
        ctx.arc(42, 510 + i * 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#475569";
      }

      // Section 3: Skills
      ctx.fillStyle = config.hexColor;
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("TECHNICAL SKILLS", 36, 615);

      ctx.fillStyle = "#475569";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(36, 635 + i * 18, i === 2 ? 320 : 520, 5);
      }

      // Section 4: Education
      ctx.fillStyle = config.hexColor;
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("EDUCATION", 36, 715);
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("B.S. in Computer Science — University of Technology", 36, 740);

      // "STOPS READING HERE" Marker Banner on texture
      const markerY = Math.round((1 - (config.stopLineY + 0.5)) * canvas.height * 0.75 + 100);
      ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
      ctx.fillRect(24, markerY - 26, canvas.width - 48, 44);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(`🛑 STOPPED READING HERE — ${config.stopText.toUpperCase()}`, 40, markerY + 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    // 3. Create 3 Stacked Resume Planes
    const planeGeo = new THREE.PlaneGeometry(2.1, 2.9, 16, 16);
    const sheets: Record<ReviewerId, THREE.Mesh> = {} as any;
    const textures: THREE.CanvasTexture[] = [];

    const order: ReviewerId[] = ["ats", "recruiter", "hiring_manager"];
    const basePositions: Record<ReviewerId, { x: number; y: number; z: number; rotZ: number }> = {
      ats: { x: -0.32, y: 0.12, z: 0.35, rotZ: 0.04 },
      recruiter: { x: 0.08, y: -0.06, z: 0.15, rotZ: -0.02 },
      hiring_manager: { x: 0.42, y: -0.22, z: -0.08, rotZ: -0.06 },
    };

    order.forEach((id) => {
      const config = REVIEWERS[id];
      const texture = createResumeTexture(config);
      textures.push(texture);

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id };
      sheets[id] = mesh;
      scene.add(mesh);
    });

    // 4. Scanning Beam Plane
    const beamGeo = new THREE.PlaneGeometry(2.2, 0.06);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const scanningBeam = new THREE.Mesh(beamGeo, beamMat);
    scene.add(scanningBeam);

    // 5. Stops Reading 3D Marker indicator
    const markerGeo = new THREE.BoxGeometry(2.15, 0.08, 0.04);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.9,
    });
    const stopsMarker = new THREE.Mesh(markerGeo, markerMat);
    scene.add(stopsMarker);

    // Mouse tracking for parallax tilt
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 0.35;
      mouse.targetY = y * 0.25;
    };
    container.addEventListener("mousemove", handleMouseMove);

    // Raycaster for clicking reviewer sheets
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(Object.values(sheets));
      if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.id as ReviewerId;
        if (clickedId && onSelectReviewer) {
          onSelectReviewer(clickedId);
        }
      }
    };
    container.addEventListener("click", handleClick);

    // Animation Loop
    let frameId: number;
    let clock = 0;
    let beamY = 1.0;
    let beamDirection = -1;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        clock += 0.016;
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      } else {
        mouse.x = 0;
        mouse.y = 0;
      }

      // Parallax container rotation
      scene.rotation.y = mouse.x * 0.5;
      scene.rotation.x = -mouse.y * 0.5;

      const currentActive = activeReviewerRef.current;

      // Adjust positions of sheets based on which reviewer is active
      order.forEach((id) => {
        const mesh = sheets[id];
        const base = basePositions[id];
        const isActive = id === currentActive;

        let targetZ = isActive ? 0.75 : base.z;
        let targetX = isActive ? 0.0 : base.x;
        let targetY = isActive ? 0.05 : base.y;
        let targetRotZ = isActive ? 0.0 : base.rotZ;

        // Smoothly interpolate positions
        mesh.position.x += (targetX - mesh.position.x) * 0.1;
        mesh.position.y += (targetY - mesh.position.y) * 0.1;
        mesh.position.z += (targetZ - mesh.position.z) * 0.1;
        mesh.rotation.z += (targetRotZ - mesh.rotation.z) * 0.1;

        if (isActive) {
          mesh.scale.set(1.05, 1.05, 1.05);
        } else {
          mesh.scale.set(0.96, 0.96, 0.96);
        }
      });

      // Update Scanning Beam position on active sheet
      const activeMesh = sheets[currentActive];
      if (activeMesh) {
        if (!prefersReducedMotion) {
          beamY += beamDirection * 0.014;
          if (beamY < -1.2) beamDirection = 1;
          if (beamY > 1.2) beamDirection = -1;
        } else {
          beamY = 0;
        }

        scanningBeam.position.x = activeMesh.position.x;
        scanningBeam.position.y = activeMesh.position.y + beamY;
        scanningBeam.position.z = activeMesh.position.z + 0.02;
        scanningBeam.rotation.z = activeMesh.rotation.z;

        // Update Stops Reading Marker position
        const reviewerConfig = REVIEWERS[currentActive];
        stopsMarker.position.x = activeMesh.position.x;
        stopsMarker.position.y = activeMesh.position.y + reviewerConfig.stopLineY;
        stopsMarker.position.z = activeMesh.position.z + 0.03;
        stopsMarker.rotation.z = activeMesh.rotation.z;

        // Light color tracks reviewer color
        pointLight.color.setHex(reviewerConfig.color);
        beamMat.color.setHex(reviewerConfig.color);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);

      planeGeo.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      textures.forEach((t) => t.dispose());
      Object.values(sheets).forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectReviewer]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 3D Scene Viewport */}
      <div
        ref={containerRef}
        aria-label="3D visualization of three reviewer pages (ATS Bot, Recruiter, Hiring Manager)"
        role="img"
        className="w-full h-[400px] sm:h-[460px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating Interactive Controls Below / Overlay */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-gray-200/80 dark:border-white/10 shadow-lg">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mr-1">
          Reviewer Layer:
        </span>
        {(Object.keys(REVIEWERS) as ReviewerId[]).map((id) => {
          const cfg = REVIEWERS[id];
          const isSelected = activeReviewer === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectReviewer?.(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isSelected
                  ? "text-white shadow-md scale-105"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
              style={{
                backgroundColor: isSelected ? cfg.hexColor : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? "#fff" : cfg.hexColor }}
              />
              {cfg.label} ({cfg.score}/100)
            </button>
          );
        })}
      </div>
    </div>
  );
}
