"use client";

import {
  Dispatch,
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
import NewsCard from "@/components/NewsCard";
import Filter from "@/components/Filter";
import { FetchMockData } from "@/app/utils/MockData";
import { FetchNewsData } from "@/app/utils/FetchNewsData";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";

interface WorldProps {
  articles: ArticleType[];
  setIsAnyOpen: Dispatch<SetStateAction<boolean>>;
  isAnyOpen: boolean;
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
  setIsAnyOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { camera } = useThree();
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  const [thisOpen, setThisOpen] = useState(false);

  const [expand, setExpand] = useState(false);

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
                  className="bg-white/25 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-2xl w-[60vw] max-w-[800px] h-[65vh] max-h-[600px] flex flex-col overflow-hidden"
                >
                  <NewsCard
                    article={article}
                    setExpand={setExpand}
                    setIsAnyOpen={setIsAnyOpen}
                    setThisOpen={setThisOpen}
                    camera={camera}
                  />
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

const EarthModel = ({ articles, setIsAnyOpen, isAnyOpen }: WorldProps) => {
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

export default function World() {
  const [locationBasedArticles, setLocationBasedArticles] = useState<
    ArticleType[]
  >([]);
  const [allArtciles, setAllArticles] = useState<ArticleType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [articleSelection, setArticleSelection] = useState<string>("Business");
  const [focusedArticle, setFocusedArticle] = useState<ArticleType>();
  const [isAnyOpen, setIsAnyOpen] = useState(false);
  const [sideBarCollapsed, setSideBarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // async function LoadArticles() {
    //   fetch(`/api/news?category=${articleSelection}`, {
    //     method: "GET",
    //     headers: {
    //       Accept: "application/json",
    //     },
    //   })
    //     .then((response) => response.json())
    //     .then((data) => {
    //       setIsLoading(false);
    //       console.log(data);
    //       setArticles(data.articles);
    //     });
    // }
    // LoadArticles();

    setAllArticles(() => {
      return FetchMockData();
    });
    setLocationBasedArticles(() => {
      return FetchMockData();
    });
    setIsLoading(false);
  }, [articleSelection]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log("Articles:", allArtciles);
  console.log("Articles:", locationBasedArticles);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [5, 0, 5], fov: 90, near: 0.1, far: 1000 }}>
        <Html
          fullscreen
          className="absolute left-0 w-auto pointer-events-none select-none"
          onDrag={(e) => e.preventDefault()}
        >
          <div className="pointer-events-auto my-[8vh]">
            {focusedArticle && (
              <div className="top-[25vh] left-[25vw] absolute bg-white/25 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-2xl w-[60vw] max-w-[800px] h-[65vh] max-h-[600px] flex flex-col overflow-hidden">
                <NewsCard
                  setIsAnyOpen={setIsAnyOpen}
                  article={focusedArticle}
                  setFocusedArticle={setFocusedArticle}
                />
              </div>
            )}
            <div className="flex">
              <div
                onWheel={(e) => e.stopPropagation()}
                className={`inline-flex flex-col overflow-y-scroll max-h-[90vh] gap-y-5 transition-all duration-500 ease-in-out ${
                  sideBarCollapsed ? "w-0" : "w-90"
                }`}
              >
                {allArtciles.map((article, index) => {
                  return (
                    <div
                      onClick={() => {
                        setIsAnyOpen(true);
                        setFocusedArticle(article);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      key={index}
                      className="card bg-gray-200/5 w-85 shadow-sm cursor-pointer"
                    >
                      {article.urlToImage && article.urlToImage.length > 0 && (
                        <figure>
                          <Image
                            src={article.urlToImage}
                            alt="Shoes"
                            width={1000}
                            height={1000}
                          />
                        </figure>
                      )}
                      <div className="card-body">
                        <div className="card-title text-[1rem]">
                          {article.title}
                        </div>
                        <p className="text-[.8rem]">{article.description}</p>
                        {article.url && (
                          <div className="flex justify-end items-center">
                            {article.url && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-start">
                <div
                  className="tooltip tooltip-right"
                  data-tip={`${
                    sideBarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
                  }`}
                >
                  <button
                    className="btn btn-ghost w-10 p-0"
                    onClick={() => setSideBarCollapsed(!sideBarCollapsed)}
                  >
                    {sideBarCollapsed ? (
                      <TbLayoutSidebarRightCollapse className="w-full h-full" />
                    ) : (
                      <TbLayoutSidebarLeftCollapse className="w-full h-full" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Html>
        <Html
          fullscreen
          className="absolute top-0 pointer-events-none select-none"
          onDrag={(e) => e.preventDefault()}
        >
          <div className="pointer-events-auto">
            <Filter
              articleSelection={articleSelection}
              setArticleSelection={setArticleSelection}
            />
          </div>
        </Html>
        <ambientLight intensity={2} />
        <Suspense fallback={null}>
          <EarthModel
            articles={locationBasedArticles!}
            setIsAnyOpen={setIsAnyOpen}
            isAnyOpen={isAnyOpen}
          />
          <Environment files="/hdr/HDR_white_local_star.hdr" background />
        </Suspense>
        <EarthOrbitControls />
      </Canvas>
    </div>
  );
}
