"use client";

import { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { ArticleType } from "@/app/page";

interface WorldProps {
  articles: ArticleType[];
}

function Pin({
  title,
  lat,
  lon,
  radius = 1,
  size = 0.03,
  color = "red",
}: {
  title?: string;
  lat: number;
  lon: number;
  radius?: number;
  size?: number;
  color?: string;
}) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  const [expand, setExpand] = useState(false);

  return (
    <>
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html position={[x, y, z]} center>
        <>
          {expand ? (
            <div className="bg-red-500 bg-center w-[50vw] max-w-[900px] h-[50vh] max-h-[500px]">
              {title}
              <button className="btn" onClick={() => setExpand(false)}></button>
            </div>
          ) : (
            <button
              style={{
                background: "blue",
                width: "1vw",
                height: "1vh",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setExpand(true);
              }}
            >
              {title}
            </button>
          )}
        </>
      </Html>
    </>
  );
}

const EarthModel = ({ articles }: WorldProps) => {
  const gl = useThree((state) => state.gl);
  const groupRef = useRef(null);
  const globeRef = useRef(null);
  const cloudsRef = useRef(null);

  const { scene } = useGLTF(
    "/earth/ktx_scene.glb",
    undefined,
    undefined,
    (loader) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      draco.setWorkerLimit(4);
      loader.setDRACOLoader(draco);

      const ktx2 = new KTX2Loader();
      ktx2.setTranscoderPath("/basis/");
      ktx2.detectSupport(gl);
      ktx2.setWorkerLimit(2);
      loader.setKTX2Loader(ktx2);
    }
  );

  useEffect(() => {
    globeRef.current = scene.getObjectByName("Earth");
    cloudsRef.current = scene.getObjectByName("EarthClouds");
  }, [scene]);

  useFrame((_, delta) => {
    // if (globeRef.current) globeRef.current.rotation.z += delta / 5;
    // if (cloudsRef.current) cloudsRef.current.rotation.z += delta / 8;
  });

  if (!globeRef) {
    return (
      <group ref={groupRef} scale={0.8} position={[2, 0, -0.5]}>
        <primitive object={scene} />
      </group>
    );
  }

  return (
    <group ref={groupRef} scale={0.8}>
      <primitive object={scene} />
      {articles.map((article, index) => {
        return (
          <Pin
            title={article.title}
            key={index}
            lat={article.location.lat}
            lon={article.location.lon}
            radius={5}
            size={0.03}
            color="red"
          />
        );
      })}
      <Pin
        title="null island"
        lat={0}
        lon={0}
        radius={5}
        size={0.03}
        color="red"
      />
    </group>
  );
};

function EarthOrbitControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<THREE.OrbitControls>(null!);

  useEffect(() => {
    if (!controlsRef.current) return;

    // centre of the globe
    controlsRef.current.target.set(0, 0, 0);

    // don’t let the user pan the target away
    controlsRef.current.enablePan = false;

    controlsRef.current.update();
  }, []);

  return <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} />;
}

export default function World({ articles }: WorldProps) {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [5, 0, 5], fov: 90, near: 0.1, far: 1000 }}>
        <ambientLight intensity={2} />
        <Suspense fallback={null}>
          <EarthModel articles={articles} />
          <Environment files="/hdr/HDR_white_local_star.hdr" background />
        </Suspense>
        <EarthOrbitControls />
      </Canvas>
    </div>
  );
}
