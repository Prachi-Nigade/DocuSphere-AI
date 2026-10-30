import React, { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";

/**
 * DocuSphereVisualizer
 * High-performance 3D interactive "alive" canvas visualization matching Image 1:
 * - 3D wireframe geodesic node sphere with depth perspective
 * - Tilted planetary orbital ring
 * - Floating cyber cube nodes with real-time 3D rotation & mouse interactivity
 * - Responsive 100% screen scale adaptation
 */
export default function DocuSphereVisualizer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // -------------------------------------------------------------
    // Normalized 3D Geometry Initialization
    // -------------------------------------------------------------
    const RING_TILT_X = 0.45; // ~26 degrees tilt
    const RING_TILT_Z = -0.35; // tilted orbit

    // 1. Generate Normalized Unit Sphere Vertices & Edges
    const unitSphereVertices = [];
    const sphereEdges = [];

    const latBands = 10;
    const lonBands = 18;

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2 * Math.PI) / lonBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        unitSphereVertices.push({
          x: sinTheta * cosPhi,
          y: cosTheta,
          z: sinTheta * sinPhi,
        });
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;

        sphereEdges.push([first, first + 1]);
        sphereEdges.push([first, second]);

        if ((lat + lon) % 2 === 0) {
          sphereEdges.push([first, second + 1]);
        }
      }
    }

    // 2. Generate Normalized Orbital Ring Points
    const ringSegments = 64;
    const unitRingPoints = [];
    for (let i = 0; i <= ringSegments; i++) {
      const angle = (i * 2 * Math.PI) / ringSegments;
      let rx = Math.cos(angle);
      let ry = 0;
      let rz = Math.sin(angle);

      // Rotate around X and Z for natural planetary tilt
      const cosTx = Math.cos(RING_TILT_X);
      const sinTx = Math.sin(RING_TILT_X);
      const y1 = ry * cosTx - rz * sinTx;
      const z1 = ry * sinTx + rz * cosTx;

      const cosTz = Math.cos(RING_TILT_Z);
      const sinTz = Math.sin(RING_TILT_Z);
      const x2 = rx * cosTz - y1 * sinTz;
      const y2 = rx * sinTz + y1 * cosTz;

      unitRingPoints.push({ x: x2, y: y2, z: z1 });
    }

    // 3. Floating Cyber Data Nodes
    const PARTICLE_COUNT = 90;
    const unitParticles = [];
    const colors = [
      "#38bdf8",
      "#818cf8",
      "#c084fc",
      "#e879f9",
      "#22d3ee",
      "#a78bfa",
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const distFactor = 1.1 + Math.random() * 0.95;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      unitParticles.push({
        distFactor,
        nx: Math.cos(phi) * Math.cos(theta),
        ny: Math.sin(phi),
        nz: Math.cos(phi) * Math.sin(theta),
        size: Math.random() < 0.3 ? 4 : Math.random() < 0.7 ? 3 : 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        isCube: Math.random() > 0.4,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // -------------------------------------------------------------
    // Physics & Interaction State
    // -------------------------------------------------------------
    let rotX = 0.2;
    let rotY = 0;
    let velX = 0.001;
    let velY = 0.0035;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      setIsInteracting(true);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handlePointerMove = (e) => {
      if (!isDragging) {
        const rect = canvas.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        velY = 0.0035 + normX * 0.004;
        velX = normY * 0.002;
        return;
      }

      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      rotY += deltaX * 0.008;
      rotX += deltaY * 0.008;
      velY = deltaX * 0.004;
      velX = deltaY * 0.004;
    };

    const handlePointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // -------------------------------------------------------------
    // 3D Matrix Projection
    // -------------------------------------------------------------
    const project3D = (px, py, pz, cx, cy, rx, ry, focalLength) => {
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y1 = py * cosX - pz * sinX;
      const z1 = py * sinX + pz * cosX;

      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x2 = px * cosY + z1 * sinY;
      const z2 = -px * sinY + z1 * cosY;

      const scale = focalLength / (focalLength + z2);
      return {
        x: cx + x2 * scale,
        y: cy + y1 * scale,
        z: z2,
        scale,
      };
    };

    // -------------------------------------------------------------
    // Animation Render Loop (60 FPS)
    // -------------------------------------------------------------
    let frameCount = 0;

    const render = () => {
      frameCount++;

      if (!isDragging) {
        rotY += velY;
        rotX += velX;
        velY = velY * 0.96 + 0.0035 * 0.04;
        velX = velX * 0.95;
      }

      ctx.clearRect(0, 0, width, height);

      // Adaptive dimensions for 100% responsive display
      const minDim = Math.min(width, height);
      const sphereRadius = Math.max(90, Math.min(minDim * 0.26, 170));
      const ringRadius = sphereRadius * 1.65;
      const focalLength = sphereRadius * 3.4;

      const cx = width * 0.5;
      const cy = height * 0.44;

      // Ambient radial glow behind the sphere
      const bgGrad = ctx.createRadialGradient(
        cx,
        cy,
        20,
        cx,
        cy,
        sphereRadius * 2.3
      );
      bgGrad.addColorStop(0, "rgba(99, 102, 241, 0.14)");
      bgGrad.addColorStop(0.5, "rgba(147, 51, 234, 0.07)");
      bgGrad.addColorStop(1, "rgba(10, 15, 30, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Project sphere vertices
      const projectedSphere = unitSphereVertices.map((v) =>
        project3D(
          v.x * sphereRadius,
          v.y * sphereRadius,
          v.z * sphereRadius,
          cx,
          cy,
          rotX,
          rotY,
          focalLength
        )
      );

      // 1. Draw Sphere Wireframe Edges
      ctx.lineWidth = 1.1;
      for (let i = 0; i < sphereEdges.length; i++) {
        const [idxA, idxB] = sphereEdges[i];
        const pA = projectedSphere[idxA];
        const pB = projectedSphere[idxB];
        if (!pA || !pB) continue;

        const avgZ = (pA.z + pB.z) * 0.5;
        const depthFactor = (avgZ + sphereRadius) / (sphereRadius * 2);
        const clampedDepth = Math.max(0.08, Math.min(1, depthFactor));

        if (avgZ < -20) {
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * clampedDepth})`;
        } else {
          ctx.strokeStyle = `rgba(129, 140, 248, ${0.32 + 0.48 * clampedDepth})`;
        }

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }

      // 2. Draw Sphere Vertices / Glowing Nodes
      for (let i = 0; i < projectedSphere.length; i += 2) {
        const p = projectedSphere[i];
        if (p.z > 8) {
          const alpha = Math.min(0.9, (p.z / sphereRadius) * 0.9);
          ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.scale * 1.8), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Tilted Planetary Orbital Ring
      const projectedRing = unitRingPoints.map((p) =>
        project3D(
          p.x * ringRadius,
          p.y * ringRadius,
          p.z * ringRadius,
          cx,
          cy,
          rotX,
          rotY,
          focalLength
        )
      );

      // Back of ring (z <= 0)
      ctx.beginPath();
      let startedBack = false;
      for (let i = 0; i < projectedRing.length; i++) {
        const p = projectedRing[i];
        if (p.z <= 0) {
          if (!startedBack) {
            ctx.moveTo(p.x, p.y);
            startedBack = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          startedBack = false;
        }
      }
      ctx.strokeStyle = "rgba(129, 140, 248, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Front of ring (z > 0)
      ctx.beginPath();
      let startedFront = false;
      for (let i = 0; i < projectedRing.length; i++) {
        const p = projectedRing[i];
        if (p.z > 0) {
          if (!startedFront) {
            ctx.moveTo(p.x, p.y);
            startedFront = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          startedFront = false;
        }
      }
      ctx.strokeStyle = "rgba(165, 180, 252, 0.7)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 4. Draw Floating Cyber Particles
      for (let i = 0; i < unitParticles.length; i++) {
        const pt = unitParticles[i];
        const r = sphereRadius * pt.distFactor;
        const proj = project3D(
          pt.nx * r,
          pt.ny * r,
          pt.nz * r,
          cx,
          cy,
          rotX,
          rotY,
          focalLength
        );

        const pulse = Math.sin(frameCount * pt.pulseSpeed + pt.pulsePhase);
        const depthAlpha = Math.max(
          0.15,
          Math.min(0.95, (proj.z + sphereRadius * 1.5) / (sphereRadius * 3))
        );
        const finalAlpha = depthAlpha * (0.75 + 0.25 * pulse);

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = finalAlpha;

        const size = Math.max(1.5, pt.size * proj.scale * (1 + 0.15 * pulse));

        if (pt.isCube) {
          ctx.fillRect(proj.x - size / 2, proj.y - size / 2, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (proj.z > 50 && pt.size >= 3) {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = finalAlpha * 0.3;
          ctx.fillRect(proj.x - size, proj.y - size, size * 2, size * 2);
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden bg-[#0A0D1E] flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 text-white"
    >
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-600/40 ring-1 ring-white/25">
            <Shield className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
              DocuSphere-AI
            </span>
            <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-normal">
              Enterprise Document Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 shadow-md">
          <span className="text-amber-400 font-serif text-sm font-extrabold leading-none">
            “
          </span>
          <span className="text-xs font-semibold text-slate-200">
            Real-time Citation Verification
          </span>
        </div>
      </div>

      {/* Center 3D Interactive Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
          title="Drag mouse to rotate 3D node network"
        />
      </div>

      {/* Bottom Quote */}
      <div className="relative z-10 max-w-xl">
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug">
          &ldquo;Extract deep multi-format citations and accurate answers from enterprise documents in seconds.&rdquo;
        </p>

        <p className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium text-indigo-400/90 hover:text-indigo-300 transition">
          <span>Drag mouse to interact with 3D DocuSphere AI Node Network</span>
          <span className="text-indigo-400 animate-pulse">→</span>
        </p>
      </div>
    </div>
  );
}
