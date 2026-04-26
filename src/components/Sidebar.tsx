import React from 'react';
import { FiHome, FiFolder, FiVideo, FiUser, FiMail } from 'react-icons/fi';

const navLinks = [
  { name: 'Home', icon: FiHome, href: '#' },
  { name: 'Projects', icon: FiFolder, href: '#' },
  { name: 'Videos', icon: FiVideo, href: '#' },
  { name: 'About', icon: FiUser, href: '#' },
  { name: 'Contact', icon: FiMail, href: '#' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen sticky top-0 bg-black/20 backdrop-blur-xl border-r border-white/5 p-8 flex flex-col items-start hidden md:flex">
      {/* Profile Section */}
      <div className="flex flex-col items-start gap-4 mb-16">
        <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-accent-glow p-[2px] bg-gradient-to-br from-accent to-[#1e1030]">
          <video 
            src="/Abhijeetprofile_video.webm" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Abhijeet Kumar</h1>
          <p className="text-sm text-gray-400">Product Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 w-full">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a 
              key={link.name} 
              href={link.href}
              className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors duration-200 group"
            >
              <Icon className="text-lg group-hover:text-accent-glow transition-colors duration-200" />
              <span className="font-medium tracking-wide">{link.name}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
