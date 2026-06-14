import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const ParticleSphere = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const count = 8000;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Build geometry ────────────────────────────────────────
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // SCATTERED start positions (random spread across space)
    const scatteredPositions = new Float32Array(count * 3);
    // SPHERE target positions
    const spherePositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Scattered: random positions in a large cube
      scatteredPositions[i * 3]     = (Math.random() - 0.5) * 80;
      scatteredPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      scatteredPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Sphere: Fibonacci sphere distribution
      const phi   = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      spherePositions[i * 3]     = 8 * Math.cos(theta) * Math.sin(phi)
                                    + (Math.random() - 0.5) * 0.5;
      spherePositions[i * 3 + 1] = 8 * Math.sin(theta) * Math.sin(phi)
                                    + (Math.random() - 0.5) * 0.5;
      spherePositions[i * 3 + 2] = 8 * Math.cos(phi)
                                    + (Math.random() - 0.5) * 0.5;

      // Colors — blue theme matching #3B82F6
      const depth =
        Math.sqrt(
          spherePositions[i * 3] ** 2 +
          spherePositions[i * 3 + 1] ** 2 +
          spherePositions[i * 3 + 2] ** 2
        ) / 8;
      const color = new THREE.Color();
      color.setHSL(0.6 + depth * 0.1, 0.8, 0.3 + depth * 0.4);
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Start with scattered positions
    for (let i = 0; i < count * 3; i++) {
      positions[i] = scatteredPositions[i];
    }

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    );

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ── Animate: scattered → sphere ───────────────────────────
    // Step 1: fade particles in (opacity 0 → 0.8) over 1s
    gsap.to(material, {
      opacity: 0.8,
      duration: 1,
      delay: 0.3,
      ease: 'power2.out',
    });

    // Step 2: morph each particle from scattered to sphere position
    // Use a proxy object to tween a single progress value 0→1
    const proxy = { progress: 0 };
    const posAttr = geometry.attributes.position;

    gsap.to(proxy, {
      progress: 1,
      duration: 2.5,
      delay: 0.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        const p = proxy.progress;
        for (let i = 0; i < count * 3; i++) {
          posAttr.array[i] =
            scatteredPositions[i] * (1 - p) +
            spherePositions[i] * p;
        }
        posAttr.needsUpdate = true;
      },
    });

    // ── Continuous rotation after morph ───────────────────────
    let rotating = false;
    setTimeout(() => {
      rotating = true;
    }, 3200); // start rotating after morph completes (~3s)

    // ── Animation loop ────────────────────────────────────────
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (rotating) {
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.0005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ────────────────────────────────────────
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.65,
      }}
    />
  );
};

export default ParticleSphere;
