"use client";

import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

// The animation variants for the cards
const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

// A reusable BentoCard component with Spotlight effect
const BentoCard = ({
  children,
  className = "",
  index,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      className={`relative rounded-2xl flex flex-col justify-center overflow-hidden transition-transform duration-300 ${className}`}
      style={{ padding: "1.5px" }} // 1.5px thin border
    >
      {/* Background layer for the static border */}
      <div className="absolute inset-0 bg-[#2a2a2a] z-0 transition-colors duration-300" />

      {/* Spotlight layer (Teal, Purple, Blue gradient) */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              rgba(45, 212, 191, 0.8),   /* Teal */
              rgba(168, 85, 247, 0.8) 40%, /* Purple */
              rgba(59, 130, 246, 0.8) 80%, /* Blue */
              transparent 100%
            )
          `,
        }}
      />

      {/* Inner Content Layer */}
      <div className="relative z-20 h-full w-full bg-[#1a1a1a]/90 backdrop-blur-md rounded-[calc(1rem-1.5px)] p-8 flex flex-col justify-center transition-colors duration-500 hover:bg-[#1a1a1a]/70">
        {children}
      </div>
    </motion.div>
  );
};

export default function BentoGrid() {
  return (
    <div className="relative w-full max-w-6xl mx-auto p-8 lg:p-12 mt-10">

      {/* Background Glowing Pulse Behind Grid */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent-glow rounded-full blur-[150px] opacity-10 pointer-events-none -z-10"
      />

      {/* Header section outside grid */}
      <div className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-2"
        >
          Product Management<br />& Development Services
        </motion.h1>
      </div>

      {/* The Bento Grid (5 Boxes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(200px,auto)] gap-6 relative z-10">

        {/* Box 1 (Top Left) */}
        <BentoCard index={0} className="items-center text-center">
          <p className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-sm">Total Experience</p>
          <h2 className="text-5xl font-light text-white">6 Years</h2>
        </BentoCard>

        {/* Box 2 (Top Middle) */}
        <BentoCard index={1} className="items-center text-center">
          <p className="text-gray-400 font-medium mb-4 uppercase tracking-wider text-sm">Education</p>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-white">MBA from IIT Delhi in Sales and Martketing </h3>
            <span className="text-accent-glow hidden md:block">—</span>
            <h3 className="text-lg font-medium text-white">B.Tech in Electrical Engineering</h3>
          </div>
        </BentoCard>

        {/* Box 5 (Right Large Box) */}
        <BentoCard index={2} className="md:col-start-3 md:row-span-2 justify-start items-start">
          <p className="text-gray-400 font-medium mb-6 uppercase tracking-wider text-sm">Professional Experience</p>
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">Associate AI Product Manager</h3>
              <p className="text-accent-glow">RCV Technologies</p>
              <p className="text-sm text-gray-500 mt-1">Jan 2025 - Present</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">Associate Product Manager</h3>
              <p className="text-accent-glow">IndiaMart Intermesh</p>
              <p className="text-sm text-gray-500 mt-1">Jun 2024 - Jan 2025</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">Sales Head</h3>
              <p className="text-accent-glow">Flexmotiv Technologies</p>
              <p className="text-sm text-gray-500 mt-1">Jan 2019 - Jun 2024</p>
            </div>
          </div>
        </BentoCard>

        {/* Box 3 (Middle Left) */}
        <BentoCard index={3} className="items-center text-center">
          <p className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-sm">Completed Projects</p>
          <h2 className="text-4xl font-light text-white mb-2">20+</h2>
          <p className="text-gray-300 text-sm">high-impact projects completed</p>
        </BentoCard>

        {/* Box 4 (Middle Middle) */}
        <BentoCard index={4} className="items-center text-center">
          <p className="text-gray-400 font-medium mb-4 uppercase tracking-wider text-sm">Programming Languages</p>
          <h2 className="text-3xl font-medium text-white mb-2">Python & MySQL</h2>
        </BentoCard>

      </div>
    </div>
  );
}
