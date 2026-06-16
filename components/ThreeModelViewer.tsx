"use client";

import { Bounds, Center, ContactShadows, Environment, Html, OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Component, Suspense, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";

function Model({ fileUrl }: { fileUrl: string }) {
  const loadedObject = useLoader(ThreeMFLoader, fileUrl);

  const model = useMemo(() => {
    const clone = loadedObject.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: "#f4f4f5", roughness: 0.58, metalness: 0.03 });
        }
      }
    });
    return clone;
  }, [loadedObject]);

  return (
    <Bounds fit clip observe margin={1.25}>
      <Center>
        <primitive object={model} />
      </Center>
    </Bounds>
  );
}

class ViewerErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-200">
            Impossibile caricare questo file .3mf.
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}

export default function ThreeModelViewer({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-black/10 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 sm:h-[540px]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [3.8, 2.6, 4.2], fov: 42, near: 0.01, far: 10000 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#f4f4f5"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 7, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 2.5, -3]} intensity={0.8} />
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-zinc-600 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-300">
                Caricamento modello 3D...
              </div>
            </Html>
          }
        >
          <ViewerErrorBoundary>
            <Model fileUrl={fileUrl} />
          </ViewerErrorBoundary>
          <Environment preset="studio" />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.35} scale={8} blur={2.2} far={4} />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}
