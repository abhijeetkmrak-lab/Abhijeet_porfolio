"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Quote } from "lucide-react";

interface Recommendation {
  id: number;
  name: string;
  designation: string;
  source: string;
  text: string;
  linkedIn: string;
  image: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    name: "Srinivas Adepu",
    designation: "Founder/CTO",
    source: "Flexmotiv",
    text: "Abhijeet was always reliable and resourceful... suggested regular internal meetups to bridge the gap between sales and technical teams.",
    linkedIn: "https://www.linkedin.com/in/srinivas-adepu/?skipRedirect=true",
    image: "/Srinivas Adepu.png",
  },
  {
    id: 2,
    name: "Girish Yadav",
    designation: "Co-Founder",
    source: "Flexmotiv",
    text: "I’ve never seen anyone embrace and embody 'constant improvement' like Abhijeet... handles patient psychology and supply chains efficiently.",
    linkedIn: "https://www.linkedin.com/in/girish-yadav1729/",
    image: "/Girish Yadav.png",
  },
  {
    id: 3,
    name: "Anuj Sabharwal",
    designation: "Senior Manager",
    source: "IndiaMART",
    text: "Demonstrated strong ownership during the IM Insta rollout, contributing meaningfully to its adoption and retention impact.",
    linkedIn: "https://www.linkedin.com/in/anuj-sabharwal-44737a1a4/",
    image: "/Anuj .png",
  },
  {
    id: 4,
    name: "Ritesh Rai",
    designation: "Co-founder",
    source: "RCV Technologies",
    text: "A rare combination of product thinking and hands-on execution... leveraging AI-driven solutions like RAG workflows to drive business metrics.",
    linkedIn: "https://www.linkedin.com/in/meriteshrai/",
    image: "/Ritesh Rai.png",
  },
  {
    id: 5,
    name: "Ashutosh Das",
    designation: "Senior Lead Dev",
    source: "RCV Technologies",
    text: "One of the few PMs who truly understands engineering constraints. Clear PRDs and structured thinking made execution faster and smoother.",
    linkedIn: "https://www.linkedin.com/in/ashutosh-das-techno-biz-expert/",
    image: "/Ashutosh das.png",
  },
  {
    id: 6,
    name: "Ankit Babu",
    designation: "Ops Expert",
    source: "Flexmotiv",
    text: "Clear thinking and clean requirements. Consistently delivers high-impact outcomes, combining analytical thinking with strong execution.",
    linkedIn: "https://www.linkedin.com/in/ankit-babu/",
    image: "/Ankit Babu .png",
  },
  {
    id: 7,
    name: "Shreya Ghosh",
    designation: "Lead Tester",
    source: "RCV Technologies",
    text: "Ensures requirements are clear and testable... his attention to detail significantly improves product quality and release stability.",
    linkedIn: "https://www.linkedin.com/in/shreya-bharti-b28642159/",
    image: "/Shreya Bharti.png",
  },
];

const RecommendationCard = ({ rec }: { rec: Recommendation }) => (
  <div className="w-[380px] min-h-[400px] h-auto mx-4 flex flex-col p-8 rounded-[2rem] bg-[#1a1a1a]/40 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
    {/* Subtle Glow Effect */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/10 blur-[80px] group-hover:bg-purple-600/20 transition-all duration-500" />
    
    <div className="relative z-10 flex flex-col h-full">
      {/* Profile Image with Ring */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-teal-400 rounded-full animate-pulse opacity-20" />
        <div className="absolute inset-[2px] bg-[#1a1a1a] rounded-full z-0" />
        <img 
          src={rec.image} 
          alt={rec.name} 
          className="relative z-10 w-full h-full object-cover rounded-full border-2 border-white/5"
        />
        <a 
          href={rec.linkedIn} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute -bottom-1 -right-1 z-20 w-8 h-8 bg-[#0077b5] rounded-full flex items-center justify-center border-2 border-[#1a1a1a] hover:scale-110 transition-transform"
        >
          <Linkedin className="w-4 h-4 text-white" />
        </a>
      </div>

      {/* Header Info */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-teal-300 transition-all duration-300">
          {rec.name}
        </h4>
        <p className="text-sm text-gray-400 font-medium">
          {rec.designation}
        </p>
        <p className="text-xs text-purple-500/80 uppercase tracking-widest mt-1">
          {rec.source}
        </p>
      </div>

      {/* Quote Text */}
      <div className="relative">
        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5" />
        <p className="text-gray-300 text-sm leading-relaxed italic whitespace-normal relative z-10">
          "{rec.text}"
        </p>
      </div>
    </div>
  </div>
);

export default function RecommendationMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const doubledRecs = [...RECOMMENDATIONS, ...RECOMMENDATIONS];

  return (
    <section className="w-full py-24 overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-8 lg:px-12 mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          What people say
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Discover what our satisfied customers and colleagues have to say about their experiences working with us.
        </motion.p>
      </div>

      <div 
        className="relative flex overflow-hidden py-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <motion.div
          animate={{ x: isPaused ? 0 : [0, -100 + "%"] }}
          transition={{
            x: {
              duration: 80,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          className="flex whitespace-nowrap"
          style={{ width: "fit-content" }}
        >
          {doubledRecs.map((rec, index) => (
            <RecommendationCard key={`${rec.id}-${index}`} rec={rec} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
