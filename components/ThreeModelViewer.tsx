"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three/examples/jsm/controls/OrbitControls.js";

function fitCameraToObject(camera: THREE.PerspectiveCamera, object: THREE.Object3D, controls: OrbitControlsType) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 1);
  const distance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));

  object.position.sub(center);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.position.set(distance * 1.2, distance * 0.8, distance * 1.35);
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.update();
}

export default function ThreeModelViewer({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Caricamento modello 3D...");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const host = container;

    let disposed = false;
    let animationFrame = 0;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4f4f5");

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "h-full w-full";
    host.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight("#ffffff", 1.25);
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    const fillLight = new THREE.DirectionalLight("#ffffff", 0.8);
    fillLight.position.set(-5, 3, -4);
    scene.add(ambientLight, keyLight, fillLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(5, 96),
      new THREE.MeshStandardMaterial({ color: "#e4e4e7", roughness: 0.74 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    let controls: OrbitControlsType | undefined;
    let loadedModel: THREE.Object3D | undefined;

    function resize() {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    async function setup() {
      try {
        const [{ OrbitControls }, { ThreeMFLoader }] = await Promise.all([
          import("three/examples/jsm/controls/OrbitControls.js"),
          import("three/examples/jsm/loaders/3MFLoader.js"),
        ]);

        if (disposed) return;

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = true;

        const loader = new ThreeMFLoader();
        loader.load(
          fileUrl,
          (object) => {
            if (disposed) return;

            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (!child.material) {
                  child.material = new THREE.MeshStandardMaterial({ color: "#f4f4f5", roughness: 0.55 });
                }
              }
            });

            loadedModel = object;
            scene.add(object);
            fitCameraToObject(camera, object, controls!);
            setStatus("");
          },
          undefined,
          () => {
            if (!disposed) setStatus("Impossibile caricare questo file .3mf.");
          },
        );
      } catch {
        if (!disposed) setStatus("Viewer 3D non disponibile.");
      }
    }

    function animate() {
      if (disposed) return;
      controls?.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    }

    setup();
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls?.dispose();
      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => material.dispose());
          }
        });
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [fileUrl]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-black/10 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 sm:h-[540px]">
      <div ref={containerRef} className="h-full w-full" />
      {status ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-zinc-100/70 text-sm font-medium text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-300">
          {status}
        </div>
      ) : null}
    </div>
  );
}
