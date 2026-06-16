"use client";

import * as THREE from "three";

function fitCamera(camera: THREE.PerspectiveCamera, object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z, 1);
  const distance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));

  object.position.sub(center);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.position.set(distance * 1.15, distance * 0.9, distance * 1.25);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

export async function generate3mfThumbnail(file: File) {
  const [{ ThreeMFLoader }] = await Promise.all([import("three/examples/jsm/loaders/3MFLoader.js")]);
  const objectUrl = URL.createObjectURL(file);
  const width = 1200;
  const height = 900;

  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4f4f5");

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.AmbientLight("#ffffff", 1.35));
    const key = new THREE.DirectionalLight("#ffffff", 2.25);
    key.position.set(5, 7, 5);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight("#ffffff", 0.9);
    fill.position.set(-4, 4, -4);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 128),
      new THREE.MeshStandardMaterial({ color: "#e4e4e7", roughness: 0.82 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.03;
    floor.receiveShadow = true;
    scene.add(floor);

    const loader = new ThreeMFLoader();
    const model = await loader.loadAsync(objectUrl);
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.material) child.material = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.55 });
      }
    });
    scene.add(model);
    fitCamera(camera, model);
    renderer.render(scene, camera);

    const blob = await new Promise<Blob>((resolve, reject) => {
      renderer.domElement.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Impossibile generare la miniatura."));
      }, "image/webp", 0.88);
    });

    renderer.dispose();
    return new File([blob], `${file.name.replace(/\.3mf$/i, "")}-cover.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
