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
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsNewspaper } from "react-icons/bs";

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
                  className="bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-[60vw] max-w-[800px] h-[65vh] max-h-[600px] flex flex-col overflow-hidden"
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
                  className="cursor-pointer flex items-center justify-center p-2 rounded-full bg-gradient-to-r from-red-500/40 via-purple-500/40 to-blue-500/40 hover:from-red-500/60 hover:via-purple-500/60 hover:to-blue-500/60 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpand(true);
                    setIsAnyOpen(true);
                    setThisOpen(true);
                    camera.translateZ(3);
                  }}
                  title={article.title}
                >
                  <BsNewspaper />
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
      {articles &&
        articles.map((article, index) => {
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

  const [searchButtonPressed, setSearchButtonPressed] =
    useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  const SearchQuery = (possibleQuery?: string) => {
    setArticleSelection("");
    fetch(`/api/news?q=${possibleQuery ? possibleQuery : query}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLocationBasedArticles(data.locationBasedArticles);
        setAllArticles(data.allArticles);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    async function LoadArticles() {
      fetch(`/api/news?category=${articleSelection}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setLocationBasedArticles(data.locationBasedArticles);
          setAllArticles(data.allArticles);
          setIsLoading(false);
        });
    }
    if (articleSelection !== "") {
      LoadArticles();
    }
  }, [articleSelection]);

  console.log("All Articles:", allArtciles);
  console.log("Location Based Articles:", locationBasedArticles);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [5, 0, 5], fov: 90, near: 0.1, far: 1000 }}>
        <Html
          fullscreen
          className="absolute pointer-events-none select-none"
          onDrag={(e) => e.preventDefault()}
        >
          {isLoading ? (
            <div className="absolute top-[50vh] left-[50vw] w-screen h-screen">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <div className="pointer-events-auto my-[8vh]">
              <div className="absolute flex flex-col right-0 mx-[1vw] gap-y-5">
                <div className="flex justify-end">
                  <button
                    data-tip="Search for News"
                    onClick={() => setSearchButtonPressed(!searchButtonPressed)}
                    className="tooltip tooltip-left cursor-pointer p-2 rounded-full bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 text-white hover:from-red-500/30 hover:via-purple-500/30 hover:to-blue-500/30 transition-all duration-200 shadow-lg border-none"
                  >
                    <FaMagnifyingGlass className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className={`relative transform transition-all duration-300 ease-out ${
                    searchButtonPressed
                      ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
                      : "opacity-0 scale-95 pointer-events-none translate-y-[-10px]"
                  }`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="flex items-center p-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          className="w-full bg-transparent text-white placeholder-white/60 px-4 py-3 pr-12 focus:outline-none text-sm font-medium"
                          placeholder="Search breaking news..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              SearchQuery();
                            }
                            if (e.key === "Escape") {
                              setSearchButtonPressed(false);
                              setQuery("");
                            }
                          }}
                          autoFocus={searchButtonPressed}
                        />
                        <FaMagnifyingGlass className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                      </div>
                      <button
                        onClick={() => SearchQuery()}
                        disabled={!query.trim()}
                        className="ml-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                        <span className="relative">Search</span>
                      </button>
                    </div>
                    <div className="px-4 pb-2">
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>Press Enter to search</span>
                        <span>ESC to close</span>
                      </div>
                    </div>
                  </div>
                  {searchButtonPressed && (
                    <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 space-y-1">
                      <div className="text-xs text-white/60 mb-2">
                        Quick searches:
                      </div>
                      {[
                        "Politics",
                        "Technology",
                        "Sports",
                        "Business",
                        "Health",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            SearchQuery(suggestion);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-150"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {focusedArticle && (
                <div className="top-[25vh] left-[25vw] absolute bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl backdrop-blur-lg border border-gray-200/50 shadow-2xl w-[60vw] max-w-[800px] h-[65vh] max-h-[600px] flex flex-col overflow-hidden">
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
                  {allArtciles &&
                    allArtciles.map((article, index) => {
                      return (
                        <div
                          onClick={() => {
                            setIsAnyOpen(true);
                            setFocusedArticle(article);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          key={index}
                          className="card bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 w-85 shadow-sm cursor-pointer"
                        >
                          {article.urlToImage &&
                            article.urlToImage.length > 0 && (
                              <figure>
                                <Image
                                  src={article.urlToImage}
                                  alt="Image cannot be shown due to source"
                                  width={1000}
                                  height={1000}
                                />
                              </figure>
                            )}
                          <div className="card-body">
                            <div className="card-title text-[1rem]">
                              {article.title}
                            </div>
                            <p className="text-[.8rem]">
                              {article.description}
                            </p>
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
                      onClick={() => setSideBarCollapsed(!sideBarCollapsed)}
                      className="cursor-pointer p-2 rounded-full bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 text-white hover:from-red-500/30 hover:via-purple-500/30 hover:to-blue-500/30 transition-all duration-200 shadow-lg border-none focus:outline-none"
                    >
                      {sideBarCollapsed ? (
                        <TbLayoutSidebarRightCollapse className="w-8 h-8" />
                      ) : (
                        <TbLayoutSidebarLeftCollapse className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
