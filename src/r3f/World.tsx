"use client";

import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * EarthModel now uses useGLTF + KTX2Loader
 */
const EarthModel = () => {
  const gl = useThree((state) => state.gl);
  const groupRef = useRef(null);
  const globeRef = useRef(null);
  const cloudsRef = useRef(null);

  // load your KTX2-optimized .glb
  const { scene } = useGLTF(
    "/earth/ktx_scene.glb",
    undefined,
    undefined,
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/"); // where you put decoder files
      draco.setWorkerLimit(4); // up to 4 worker threads
      loader.setDRACOLoader(draco);

      //
      // 2) KTX2 in WebWorker
      //
      const ktx2 = new KTX2Loader();
      ktx2.setTranscoderPath("/basis/"); // where you put transcoder files
      ktx2.detectSupport(gl);
      // tell it to spin up a worker per transcoder script
      ktx2.setWorkerLimit(2); // limit concurrency
      loader.setKTX2Loader(ktx2);
    }
  );

  useEffect(() => {
    globeRef.current = scene.getObjectByName("Earth");
    cloudsRef.current = scene.getObjectByName("EarthClouds");
  }, [scene]);

  // spin them
  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.z += delta / 5;
    if (cloudsRef.current) cloudsRef.current.rotation.z += delta / 8;
  });

  return (
    <group ref={groupRef} scale={0.8} position={[2, 0, -0.5]}>
      <primitive object={scene} />
    </group>
  );
};

function SetCameraAroundEarth() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(-3, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function World() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [10, 0, 10], fov: 90, near: 0.1, far: 1000 }}>
        <ambientLight intensity={2} />
        <Suspense fallback={null}>
          <EarthModel />
          <Environment files="/hdr/HDR_white_local_star.hdr" background />
        </Suspense>
        <SetCameraAroundEarth />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
