"use client";

import {
  memo,
  SetStateAction,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { motion, AnimatePresence } from "framer-motion";
import { ArticleType } from "@/app/page";
import Image from "next/image";

interface WorldProps {
  articles: ArticleType[];
}

function Pin({
  article,
  lat,
  lon,
  radius = 1,
  size = 0.03,
  color = "red",
  occluder,
  isAnyOpen,
  setIsAnyOpen,
}: {
  article: ArticleType;
  lat: number;
  lon: number;
  radius?: number;
  size?: number;
  color?: string;
  occluder?: THREE.Object3D | null;
  isAnyOpen: boolean;
  setIsAnyOpen: any;
}) {
  const { camera } = useThree();
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  const [thisOpen, setThisOpen] = useState(false);

  const [expand, setExpand] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (!isAnyOpen || thisOpen)
    return (
      <>
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Html position={[x, y, z]} center distanceFactor={10}>
          <div className="relative">
            <AnimatePresence>
              {expand ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  style={{
                    zIndex: "100",
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-2xl w-[60vw] max-w-[800px] h-[65vh] max-h-[600px] flex flex-col overflow-hidden"
                >
                  <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">
                        {article.source?.name || "Unknown Source"}
                      </span>
                    </div>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpand(false);
                        setIsAnyOpen(false);
                        setThisOpen(false);
                        camera.translateZ(-3);
                      }}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto p-6 pt-2">
                    {article.urlToImage != null &&
                      article.urlToImage.length > 0 && (
                        <div className="mb-6 rounded-xl overflow-hidden">
                          <Image
                            src={article.urlToImage!}
                            alt={article.title}
                            width={1000}
                            height={1000}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                    <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                      {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                      {article.author && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>{article.author}</span>
                        </div>
                      )}
                      {article.publishedAt && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      )}
                    </div>

                    {article.description && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Summary
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {article.description}
                        </p>
                      </div>
                    )}

                    {article.content && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Content Preview
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(article.content, 300)}
                        </p>
                      </div>
                    )}

                    {article.location && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="font-semibold text-gray-800">
                            Location
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Latitude: {article.location.lat.toFixed(4)},
                          Longitude: {article.location.lon.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer with action buttons */}
                  <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex justify-end items-center">
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Read Full Article
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpand(true);
                    setIsAnyOpen(true);
                    setThisOpen(true);
                    camera.translateZ(3);
                  }}
                  title={article.title}
                >
                  !
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </Html>
      </>
    );
}

const EarthModel = ({ articles }: WorldProps) => {
  const gl = useThree((state) => state.gl);
  const groupRef = useRef(null);
  const globeRef = useRef(null);
  const cloudsRef = useRef(null);
  const [isAnyOpen, setIsAnyOpen] = useState(false);

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
    if (cloudsRef.current) cloudsRef.current.rotation.z += delta / 100;
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
            article={article}
            key={index}
            lat={article.location.lat}
            lon={article.location.lon}
            radius={5.04}
            size={0.03}
            color="red"
            occluder={globeRef.current as THREE.Object3D}
            isAnyOpen={isAnyOpen}
            setIsAnyOpen={setIsAnyOpen}
          />
        );
      })}
    </group>
  );
};

function EarthOrbitControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<THREE.OrbitControls>(null!);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);
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
