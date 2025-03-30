"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Home, Settings, User, ChevronLeft } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Sidebar (Slides In/Out) */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-screen w-64 bg-[#fafafa] text-black shadow-2xl p-5 flex flex-col justify-between z-[60]"
      >
        {/* Toggle Button (Inside Sidebar) */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-md shadow-lg hover:bg-gray-700 transition"
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        {/* Sidebar Menu */}
        <div className="space-y-6 mt-12">
          <h2 className="text-lg font-bold"></h2>
          <NavItem Icon={Home} label="Home" />
          <NavItem Icon={Settings} label="Settings" />
          <NavItem Icon={User} label="Profile" />
        </div>

        {/* Profile Button */}
        <div className="flex justify-center">
          <button className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center">
            A
          </button>
        </div>
      </motion.div>

      {/* Toggle Button (Always Visible) */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-gray-800 text-white rounded-md shadow-lg hover:bg-gray-700 transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}

// Reusable Sidebar Button Component
function NavItem({ Icon, label }) {
  return (
    <button className="flex items-center p-3 hover:bg-[#efeded] rounded-lg transition w-full text-left">
      <Icon className="w-6 h-6 mr-3 text-black" />
      {label}
    </button>
  );
}