import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../context/StoreContext';
import { Zap, Truck, Tag } from 'lucide-react';

function HeroScene3D({ className = "" }) {
  const mountRef = useRef(null);
  const { hoveredMeshKey } = useStore();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    // ---- Scene setup ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ---- Lighting: soft key + warm fill + ambient ----
    const key = new THREE.DirectionalLight(0xfff3e0, 1.3);
    key.position.set(4, 6, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd9e8ff, 0.45);
    fill.position.set(-5, 2, -3);
    scene.add(fill);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    // ---- Materials: Glossy clearcoat caps, matte bodies ----
    const glossyCap = (color) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.15,
        metalness: 0.05,
        clearcoat: 0.55,
        clearcoatRoughness: 0.2,
      });

    const matteBody = (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.75,
        metalness: 0.02,
      });

    // ---- Helper: soft radial-gradient shadow sprite under each item ----
    function makeShadowTexture() {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      grad.addColorStop(0, "rgba(18,35,27,0.35)");
      grad.addColorStop(0.6, "rgba(18,35,27,0.14)");
      grad.addColorStop(1, "rgba(18,35,27,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(canvas);
    }
    const shadowTexture = makeShadowTexture();

    function addShadow(x, z, scale) {
      const mat = new THREE.SpriteMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(scale, scale * 0.5, 1);
      sprite.position.set(x, -1.55, z);
      scene.add(sprite);
    }

    // ---- Build the 7-item grocery cluster ----
    const cluster = new THREE.Group();
    const orbitables = []; // { mesh, baseY, phase, key }

    function addItem(build, x, y, z, meshKey, depth = 0) {
      const item = build();
      item.position.set(x, y, z);
      cluster.add(item);
      orbitables.push({ mesh: item, baseY: y, phase: Math.random() * Math.PI * 2, key: meshKey });
      addShadow(x, z, 1.2 - depth * 0.15);
    }

    // 1. Milk bottle
    addItem(() => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 1.3, 24),
        matteBody(0xf3f1ea)
      );
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.43, 0.43, 0.35, 24),
        matteBody(0x2c7fb8)
      );
      band.position.y = -0.1;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.24, 0.28, 16),
        glossyCap(0x123027)
      );
      cap.position.y = 0.79;
      g.add(body, band, cap);
      return g;
    }, -2.6, 0.3, -0.4, 'milk', 0);

    // 2. Ghee tub
    addItem(() => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.46, 0.62, 24),
        matteBody(0xf6ecd8)
      );
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.16, 24),
        glossyCap(0xb23a30)
      );
      lid.position.y = 0.39;
      g.add(body, lid);
      return g;
    }, -1.1, -0.2, 0.6, 'milk', 1);

    // 3. Spice jar (Guntur chili / turmeric)
    addItem(() => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 24, 24),
        matteBody(0x123027)
      );
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.18, 16),
        glossyCap(0xc6862b)
      );
      cap.position.y = 0.5;
      g.add(body, cap);
      return g;
    }, 0.3, 0.5, -0.2, 'spice', 0);

    // 4. Pickle jar
    addItem(() => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.38, 0.85, 20),
        matteBody(0xf3f1ea)
      );
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.18, 20),
        glossyCap(0xc6862b)
      );
      lid.position.y = 0.5;
      g.add(body, lid);
      return g;
    }, 1.6, -0.3, 0.4, 'spice', 1);

    // 5. Rice sack (rounded box)
    addItem(() => {
      const geo = new THREE.BoxGeometry(0.95, 1.15, 0.55, 2, 2, 2);
      const body = new THREE.Mesh(geo, matteBody(0xece2c8));
      return body;
    }, 2.9, 0.15, -0.3, 'rice', 0);

    // 6. Coconut
    addItem(() => {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 20, 20),
        matteBody(0x3a2c22)
      );
      return body;
    }, 0.9, 1.15, 0.9, 'coconut', 2);

    // 7. Small fruit stack (2 spheres)
    addItem(() => {
      const g = new THREE.Group();
      const a = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 18, 18),
        glossyCap(0xb23a30)
      );
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 18, 18),
        glossyCap(0xc6862b)
      );
      a.position.set(-0.15, 0, 0);
      b.position.set(0.2, 0.05, 0.15);
      g.add(a, b);
      return g;
    }, -0.4, -0.6, 1.3, 'snack', 2);

    scene.add(cluster);
    cluster.position.y = 0.3;

    // ---- Pointer parallax target ----
    const pointer = { x: 0, y: 0 };
    function onPointerMove(e) {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    if (!isTouch && !prefersReducedMotion) {
      window.addEventListener("pointermove", onPointerMove);
    }

    // ---- Animation loop ----
    let raf;
    const clock = new THREE.Clock();

    function tick() {
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // slow ambient rotation of the whole cluster (unchanged speed from v1)
        cluster.rotation.y = t * 0.12;

        // gentle per-item bob & hover highlights
        orbitables.forEach(({ mesh, baseY, phase, key }) => {
          mesh.position.y = baseY + Math.sin(t * 0.8 + phase) * 0.06;
          if (hoveredMeshKey === key) {
            mesh.scale.setScalar(1.2 + Math.sin(t * 4) * 0.05);
          } else {
            mesh.scale.setScalar(1.0);
          }
        });

        // mouse-parallax tilt (desktop only)
        if (!isTouch) {
          cluster.rotation.x += (pointer.y * 0.12 - cluster.rotation.x) * 0.04;
          cluster.rotation.z += (-pointer.x * 0.06 - cluster.rotation.z) * 0.04;
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    // ---- Resize handling ----
    function onResize() {
      if (!mount) return;
      const { clientWidth, clientHeight } = mount;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (!isTouch && !prefersReducedMotion) {
        window.removeEventListener("pointermove", onPointerMove);
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [hoveredMeshKey]);

  return <div ref={mountRef} className={className} />;
}

export default function Hero3D() {
  const { hoveredMeshKey } = useStore();

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] rounded-crate bg-hero-gradient border border-hairline hero-card-highlight shadow-crate flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 mb-8 overflow-hidden">
      
      {/* Hero Left Content */}
      <div className="z-10 max-w-xl text-left space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-forest/10 text-forest rounded-full text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
          NBS Tech Solutions • Kirana at Delivery Speed
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-bold text-ink leading-[1.1] tracking-tight">
          Your neighborhood grocer, running at{' '}
          <span className="font-serif italic text-saffron-gradient font-normal">
            15-minute speed.
          </span>
        </h1>

        <p className="text-ink-soft text-sm sm:text-base font-sans leading-relaxed max-w-md">
          Fresh rice, dals, pure ghee, morning milk, cold drinks, and daily pooja essentials delivered straight to your doorstep.
        </p>

        {/* Feature Badges & Delivery Threshold Notice */}
        <div className="pt-1 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-saffron-gradient text-ink rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
            <Zap className="w-4 h-4 fill-ink" />
            <span>Emergency 15-min delivery available</span>
          </div>

          <div className="px-4 py-2 bg-forest text-paper rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-saffron-highlight" />
            <span>FREE Delivery on orders over ₹199</span>
          </div>
        </div>

        <p className="text-[11px] text-ink-soft/80 flex items-center gap-1 font-mono">
          <Tag className="w-3.5 h-3.5 text-saffron-base" />
          <span>Nominal ₹10 fee applies only for orders under ₹199</span>
        </p>
      </div>

      {/* 3D Living Inventory Interactive Canvas */}
      <div className="relative w-full md:w-1/2 h-[240px] md:h-full mt-2 md:mt-0 flex items-center justify-center">
        <HeroScene3D className="w-full h-full cursor-pointer" />

        {/* Dynamic Hover Hint Badge */}
        {hoveredMeshKey && (
          <div className="absolute bottom-2 right-4 px-3 py-1 bg-ink text-paper rounded-full text-xs font-mono shadow-md animate-fade-in border border-hairline">
            Connected 3D Item: <span className="text-saffron-highlight capitalize">{hoveredMeshKey}</span>
          </div>
        )}
      </div>

    </div>
  );
}
