"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  ShieldAlert,
  ExternalLink,
  Trophy,
} from "lucide-react";

import { ScrambleText } from "./components/ScrambleText";
import { ProfessionalLoader } from "./components/ProfessionalLoader";
import { Marquee } from "./components/Marquee";
import { SectionTitle } from "./components/SectionTitle";
import { preloadStatueModel } from "./components/StatueModel";

const StatueModel = dynamic(
  () => import("./components/StatueModel").then((mod) => ({ default: mod.StatueModel })),
  { ssr: false }
);

function StatueModelWithMotion({ 
  cameraZMotion, 
  cameraYMotion, 
  centerXMotion,
  rotationYMotion,
  onLoaded
}: { 
  cameraZMotion: MotionValue<number>; 
  cameraYMotion: MotionValue<number>; 
  centerXMotion: MotionValue<number>;
  rotationYMotion: MotionValue<number>;
  onLoaded?: () => void;
}) {
  const [cameraZ, setCameraZ] = useState(3);
  const [cameraY, setCameraY] = useState(0.5);
  const [centerX, setCenterX] = useState(0.3);
  const [rotationY, setRotationY] = useState(0);

  useMotionValueEvent(cameraZMotion, "change", (latest) => setCameraZ(latest));
  useMotionValueEvent(cameraYMotion, "change", (latest) => setCameraY(latest));
  useMotionValueEvent(centerXMotion, "change", (latest) => setCenterX(latest));
  useMotionValueEvent(rotationYMotion, "change", (latest) => setRotationY(latest));

  return <StatueModel cameraZ={cameraZ} cameraY={cameraY} centerX={centerX} rotationY={rotationY} onLoaded={onLoaded} />;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    preloadStatueModel((progress) => {
      setModelProgress(progress);
    });
  }, []);

  const handleModelLoaded = () => {
    setModelReady(true);
  };

  const handleLoaderComplete = () => {
    if (modelReady) {
      setLoading(false);
    } else {
      const checkReady = setInterval(() => {
        if (modelReady) {
          clearInterval(checkReady);
          setLoading(false);
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (modelReady && modelProgress >= 100) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [modelReady, modelProgress]);

  const statueTransitionRef = useRef(null);
  const [isStatueFixed, setIsStatueFixed] = useState(true);
  const { scrollYProgress: statueProgress } = useScroll({
    target: statueTransitionRef,
    offset: ["start end", "end end"]
  });

  useMotionValueEvent(statueProgress, "change", (latest) => {
    setIsStatueFixed(latest < 0.99);
  });

  const cameraZ = useTransform(statueProgress, [0, 1], [3, 17]);
  const cameraY = useTransform(statueProgress, [0, 1], [0.5, 0]);
  const centerX = useTransform(statueProgress, [0, 1], [0.3, -2.1]);
  const rotationY = useTransform(statueProgress, [0, 1], [0, Math.PI * 2]);

  const projects = [
    {
      id: "01",
      title: "KODA",
      role: "AI Agentic Architect",
      desc: "Implementación multi-agente con LangGraph para la autonomía de flujos DevOps.",
      tags: ["LangGraph", "A2A Protocol", "MCP"],
    },
    {
      id: "02",
      title: "CAG Engine",
      role: "Lead AI Researcher",
      desc: "Investigación en Cache-Augmented Generation para optimización masiva de tokens.",
      tags: ["Google Gemini", "RAG/CAG", "Vector DB"],
    },
    {
      id: "03",
      title: "Cloud Bot",
      role: "Backend Infrastructure",
      desc: "Automatización de despliegue en AWS mediante procesamiento de lenguaje natural.",
      tags: ["AWS Cloud", "Go", "Kafka"],
    },
  ];

  const publications = [
    {
      year: "2024",
      title: "IA Generativa: Una Nueva Frontera en la Automatización DevOps",
      context: "Investigación Publicada / ESPE",
    },
    {
      year: "2023",
      title: "Generación de Código desde Interfaces Visuales mediante LLMs",
      context: "Paper Aceptado / Arquitectura Software",
    },
  ];

  const awards = [
    {
      title: "GitHub Campus Expert",
      org: "GitHub Education",
      year: "2023",
      icon: <Trophy />,
    },
    {
      title: "Hackathon Winner",
      org: "ESPE / Future Devs",
      year: "2022",
      icon: <Trophy />,
    },
    {
      title: "Math Excellence",
      org: "Pierre Fermat",
      year: "2019",
      icon: <Trophy />,
    },
  ];

  const techStack = [
    "AWS Cloud",
    "LangChain",
    "Next.js",
    "Go Language",
    "Python AI",
    "Kafka",
    "PostgreSQL",
    "React Native",
  ];

  return (
    <div className="bg-[#050505] text-white selection:bg-[#39ff14] selection:text-black font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        {loading && (
          <ProfessionalLoader 
            modelProgress={modelProgress}
            modelReady={modelReady}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#39ff14] z-[90] origin-left shadow-[0_0_10px_rgba(57,255,20,0.5)]"
        style={{ scaleX }}
      />

      {/* Navbar */}
      {!loading && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 w-full p-10 flex justify-between items-center z-50 mix-blend-difference"
        >
          <span className="font-black tracking-tighter text-3xl font-mono text-[#39ff14] italic">
            AO
          </span>
          <div className="hidden md:flex gap-16 text-[10px] uppercase tracking-[0.5em] font-bold opacity-60 hover:opacity-100 transition-opacity">
            <a href="#work" className="hover:text-[#39ff14]">
              Portafolio
            </a>
            <a href="#research" className="hover:text-[#39ff14]">
              Investigación
            </a>
            <a href="#about" className="hover:text-[#39ff14]">
              Sistema
            </a>
            <a href="#contact" className="hover:text-[#39ff14]">
              Terminal
            </a>
          </div>
        </motion.nav>
      )}

      {/* Hero Section */}
      <div>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          {/* Animated grid background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute inset-0"
              animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundImage: `
                  linear-gradient(rgba(57,255,20,0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(57,255,20,0.04) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(57,255,20,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(57,255,20,0.05)_0%,transparent_40%)]" />

          <div className="max-w-7xl w-full relative z-20 lg:max-w-[55%] lg:mr-auto">
            {!loading && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2, delayChildren: 0.6 },
                  },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="inline-flex items-center gap-3 px-4 py-1 border border-[#39ff14]/30 rounded-sm mb-12 bg-[#39ff14]/10"
                >
                  <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse shadow-[0_0_10px_#39ff14]" />
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#39ff14]/80 font-black italic">
                    System_User: Andres_Ortiz
                  </span>
                </motion.div>

                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                  }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[13vw] lg:text-[11vw] font-black leading-[0.8] tracking-[-0.05em] uppercase mb-16"
                >
                  <ScrambleText text="ARQUITECTO" delay={1400} /> <br />
                  <span className="text-transparent italic-stroke opacity-90 block mt-4">
                    <ScrambleText text="DIGITAL" delay={2000} />
                  </span>
                </motion.h1>

                <div className="grid md:grid-cols-2 gap-20 items-end">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    <p className="text-2xl md:text-3xl text-white/40 leading-none font-light tracking-tighter max-w-xl">
                      Ingeniería de{" "}
                      <span className="text-white">sistemas agénticos</span> y
                      despliegue de{" "}
                      <span className="text-[#39ff14] italic font-medium tracking-normal">
                        IA Generativa
                      </span>
                      .
                    </p>
                    <div className="flex gap-10 items-center text-[#39ff14] opacity-60">
                      <div className="h-[1px] w-24 bg-[#39ff14]" />
                      <span className="text-[10px] uppercase tracking-[0.5em] font-black italic">
                        Next-Gen Architecture
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 30 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex flex-col items-start md:items-end gap-6 border-l md:border-l-0 md:border-r border-[#39ff14]/20 pl-8 md:pl-0 md:pr-8"
                  >
                    <div className="flex gap-10">
                      <a
                        href="#"
                        className="hover:text-[#39ff14] transition-all scale-125"
                      >
                        <Linkedin size={22} />
                      </a>
                      <a
                        href="#"
                        className="hover:text-[#39ff14] transition-all scale-125"
                      >
                        <Github size={22} />
                      </a>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-mono">
                      QUITO_EC // OPS_CENTER
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* About Section */}
      <section
        id="about"
        className="relative py-48 px-6 bg-white text-black rounded-[3vw] md:rounded-[5vw] mx-2 md:mx-6 overflow-hidden"
        ref={statueTransitionRef}
      >
        {/* Modelo 3D de estatua - se monta siempre para pre-renderizar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 1.4, delay: loading ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={`hidden lg:flex items-center justify-center z-40 w-[50%] pointer-events-none ${
            isStatueFixed 
              ? "fixed right-0 top-0 bottom-0" 
              : "absolute right-0 bottom-0 h-screen"
          }`}
        >
          <div className="relative w-full h-full">
            <StatueModelWithMotion 
              cameraZMotion={cameraZ} 
              cameraYMotion={cameraY} 
              centerXMotion={centerX}
              rotationYMotion={rotationY}
              onLoaded={handleModelLoaded}
            />
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-32 items-start">
          <div className="sticky top-40">
            <SectionTitle subtitle="Core Logic">
              Filosofía de <br /> Diseño
            </SectionTitle>
            <p className="text-3xl font-light leading-none text-black/40 mb-12">
              Transformando la complejidad técnica en{" "}
              <span className="font-bold text-black uppercase tracking-tighter italic">
                motores de eficiencia
              </span>
              .
            </p>
            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-black/10">
              <div>
                <h4 className="text-5xl font-black mb-2 tracking-tighter">
                  50%
                </h4>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-40 leading-none">
                  Aumento en Velocidad DevOps
                </p>
              </div>
              <div>
                <h4 className="text-5xl font-black mb-2 tracking-tighter">
                  AWS
                </h4>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-40 leading-none">
                  Cloud Native Solutions
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-20 py-20">
            <div className="p-16 bg-black text-white rounded-3xl transform hover:rotate-1 transition-transform duration-700 shadow-2xl">
              <ShieldAlert className="text-[#39ff14] mb-10" size={48} />
              <h4 className="text-4xl font-black mb-8 uppercase tracking-tighter leading-none">
                Redefiniendo la IA
              </h4>
              <p className="text-xl opacity-60 leading-relaxed font-light italic">
                &quot;Mi trabajo con Cache-Augmented Generation (CAG) rompe las
                barreras del RAG tradicional, permitiendo una recuperación de
                información instantánea y de ultra-bajo costo.&quot;
              </p>
            </div>
            <p className="text-2xl leading-relaxed font-light text-black/80">
              Como **GitHub Campus Expert**, lidero la vanguardia de la
              ingeniería de software en Latinoamérica, fusionando la
              investigación académica con la ejecución pragmática en la nube.
            </p>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="Operations">
            Portafolio <br /> Estratégico
          </SectionTitle>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col md:flex-row items-center justify-between p-16 border border-white/5 hover:border-[#39ff14]/40 hover:bg-[#39ff14]/[0.02] transition-all duration-700 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-16 relative z-10">
                  <span className="text-xs font-mono text-[#39ff14] font-bold tracking-[0.3em]">
                    MOD_0{index + 1}
                  </span>
                  <h3 className="text-5xl md:text-8xl font-black tracking-tighter uppercase transition-all group-hover:italic">
                    {project.title}
                  </h3>
                </div>
                <div className="max-w-md mt-10 md:mt-0 md:text-right relative z-10">
                  <p className="text-white/40 text-xl mb-8 font-light italic leading-tight">
                    // {project.desc}
                  </p>
                  <div className="flex gap-3 justify-end flex-wrap">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-4 py-2 bg-white/5 rounded-full border border-white/10 uppercase tracking-widest font-bold text-white/30 group-hover:border-[#39ff14] group-hover:text-[#39ff14] transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <ArrowUpRight size={40} className="text-[#39ff14]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Publications */}
      <section id="research" className="py-48 px-6 bg-[#39ff14] text-black">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="Intelligence">
            Investigación <br /> Científica
          </SectionTitle>
          <div className="grid md:grid-cols-2 gap-8">
            {publications.map((pub, i) => (
              <div
                key={i}
                className="group p-16 border-2 border-white/20 hover:bg-white hover:text-black transition-all duration-700 rounded-sm"
              >
                <div className="flex justify-between items-start mb-20">
                  <span className="text-6xl font-black italic opacity-30 group-hover:opacity-100">
                    {pub.year}
                  </span>
                  <ExternalLink
                    size={28}
                    className="opacity-20 group-hover:opacity-100"
                  />
                </div>
                <h4 className="text-3xl md:text-4xl font-black leading-tight mb-8 uppercase tracking-tighter italic">
                  &quot;{pub.title}&quot;
                </h4>
                <p className="text-[10px] uppercase tracking-[0.6em] font-black opacity-50">
                  {pub.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-48 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="Validation">Méritos</SectionTitle>
          <div className="grid md:grid-cols-3 gap-1">
            {awards.map((award, i) => (
              <div
                key={i}
                className="p-16 border border-white/5 hover:border-[#39ff14] transition-all group relative overflow-hidden bg-white/[0.01]"
              >
                <div className="mb-12 text-[#39ff14] transform group-hover:scale-110 transition-transform">
                  {award.icon}
                </div>
                <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter leading-none">
                  {award.title}
                </h4>
                <p className="text-white/30 uppercase text-[10px] tracking-[0.4em] font-black">
                  {award.org} // {award.year}
                </p>
                <div className="absolute -bottom-10 -right-10 text-white/[0.02] text-9xl font-black italic group-hover:text-[#39ff14]/5 transition-colors">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-12">
        <Marquee items={techStack} />
      </section>

      {/* Footer / CTA */}
      <footer
        id="contact"
        className="py-64 px-6 relative bg-white text-black overflow-hidden rounded-t-[5vw]"
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-7xl md:text-[11vw] font-black tracking-tighter uppercase mb-20 leading-[0.8]">
              <ScrambleText text="CREAMOS EL FUTURO" delay={300} />
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
              <a
                href="mailto:andres.ortiz.h.2001@gmail.com"
                className="group relative inline-flex items-center gap-10 bg-black text-white px-24 py-12 rounded-sm text-3xl font-black hover:bg-[#39ff14] hover:text-black transition-all uppercase tracking-tighter"
              >
                <span>Ejecutar Contacto</span>
                <ArrowUpRight
                  className="group-hover:rotate-45 transition-transform"
                  size={32}
                />
              </a>
              <div className="text-left font-mono">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 leading-none mb-2">
                  Network_Status
                </p>
                <p className="text-2xl font-black uppercase italic tracking-tighter">
                  Handshake_Open
                </p>
              </div>
            </div>

            <div className="mt-48 grid md:grid-cols-3 gap-24 pt-20 border-t border-black/10 text-left">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-30">
                  // Location
                </p>
                <p className="text-2xl font-bold uppercase italic tracking-tighter">
                  Quito, Ecuador
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-30">
                  // Digital_Identity
                </p>
                <div className="flex gap-12">
                  <Linkedin
                    size={32}
                    className="hover:text-[#39ff14] cursor-pointer transition-colors"
                  />
                  <Github
                    size={32}
                    className="hover:text-[#39ff14] cursor-pointer transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-4 md:text-right">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-30">
                  // System_Build
                </p>
                <p className="text-sm font-mono opacity-40 uppercase">
                  v4.0.0_STABLE_AI
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#39ff14]" />
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .italic-stroke { -webkit-text-stroke: 1px rgba(255,255,255,1); color: transparent; }
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700;900&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; background: #050505; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #39ff14; border-radius: 10px; }
      `}} />
    </div>
  );
}
