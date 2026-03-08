"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ModelProps {
  rotationY?: number;
  onLoaded?: () => void;
}

function CameraController({ cameraZ, cameraY, centerX }: { cameraZ?: number; cameraY?: number; centerX?: number }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, cameraZ ?? 3, 0.05);
    cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, cameraY ?? 0.5, 0.05);
    cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, centerX ?? 0.3, 0.05);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={25}
      position={[0.3, 0.5, 3]}
      near={0.1}
      far={100}
    />
  );
}

function Model({ rotationY = 0, onLoaded }: ModelProps) {
  const { scene } = useGLTF("/estatua.glb");
  const ref = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (!ref.current) return;

    const box = new THREE.Box3().setFromObject(ref.current);
    const size = box.getSize(new THREE.Vector3());

    ref.current.position.x = 0.40;
    ref.current.position.y = -size.y * 0.32;
    ref.current.position.z = 0;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.isMeshStandardMaterial) {
            mat.envMapIntensity = 1.2;
            mat.needsUpdate = true;
          }
        }
      }
    });

    onLoaded?.();
  }, [clonedScene, onLoaded]);

  useEffect(() => {
    targetRotation.current = rotationY;
  }, [rotationY]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotation.current, 0.05);
  });

  return (
    <group ref={ref} scale={2.5}>
      <primitive object={clonedScene} />
    </group>
  );
}

interface StatueModelProps {
  cameraZ?: number;
  cameraY?: number;
  centerX?: number;
  rotationY?: number;
  onLoaded?: () => void;
}

export const StatueModel = ({ cameraZ = 3, cameraY = 0.5, centerX = 0.3, rotationY = 0, onLoaded }: StatueModelProps) => (
  <Canvas
    style={{ width: "100%", height: "100%" }}
    gl={{ 
      antialias: true, 
      alpha: true, 
      toneMapping: THREE.ACESFilmicToneMapping, 
      toneMappingExposure: 1.2 
    }}
  >
    <Suspense fallback={null}>
      <CameraController cameraZ={cameraZ} cameraY={cameraY} centerX={centerX} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" castShadow />
      <directionalLight position={[-3, 4, -5]} intensity={0.6} color="#39ff14" />
      <pointLight position={[2, 2, 3]} intensity={0.5} color="#39ff14" />
      <Model rotationY={rotationY} onLoaded={onLoaded} />
      <Environment preset="studio" background={false} />
    </Suspense>
  </Canvas>
);

export const preloadStatueModel = (onProgress: (progress: number) => void): Promise<void> => {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(
      "/estatua.glb",
      () => {
        onProgress(100);
        resolve();
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Error loading model:", error);
        onProgress(100);
        resolve();
      }
    );
  });
};

useGLTF.preload("/estatua.glb");
