"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";

export default function Dashboard() {
  const [taskInput, setTaskInput] = useState("");
  const [taskCategory, setTaskCategory] = useState("Not Yet");
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tasks, setTasks] = useState({
    "Not Yet": [],
    "Needed": [],
    "Totally Needed": [],
  });

  const categories = [
    { label: "Not Yet 📌", color: "text-red-500" },
    { label: "Needed 📌", color: "text-yellow-500" },
    { label: "Totally Needed 📌", color: "text-blue-500" },
  ];

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!taskInput.trim()) return;

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      if (!Array.isArray(updatedTasks[taskCategory])) {
        updatedTasks[taskCategory] = [];
      }

      if (editingIndex !== null) {
        updatedTasks[taskCategory][editingIndex] = taskInput;
      } else {
        updatedTasks[taskCategory] = [...updatedTasks[taskCategory], taskInput];
      }

      return updatedTasks;
    });

    setEditingIndex(null);
    setTaskInput("");
  };

  const deleteTask = (category, index) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [category]: prevTasks[category].filter((_, i) => i !== index),
    }));
  };

  const editTask = (category, index) => {
    setTaskInput(tasks[category][index]);
    setTaskCategory(category);
    setEditingIndex(index);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6 font-poppins ml-18">Board View</h1>

        <div className="bg-white shadow-lg rounded-lg p-4 w-full mb-6">
          <textarea
            className="w-full border rounded p-2 mb-2 resize-none h-24"
            placeholder="Enter task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />

          <div className="relative w-full">
            <motion.div
              className="w-full border rounded p-2 mb-4 cursor-pointer bg-white shadow-md flex justify-between items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`font-semibold ${categories.find(cat => cat.label.includes(taskCategory))?.color}`}>
                {taskCategory}
              </span>
              <span className="text-gray-500">▼</span>
            </motion.div>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full bg-white shadow-lg rounded-md overflow-hidden border"
                >
                  {categories.map((cat) => (
                    <motion.li
                      key={cat.label}
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${cat.color}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTaskCategory(cat.label.replace("📌", "").trim());
                        setIsDropdownOpen(false);
                      }}
                    >
                      {cat.label}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 active:scale-95"
            onClick={addTask}
          >
            {editingIndex !== null ? "Update Task" : "Create Task"}
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {categories.map(({ label, color }) => (
            <div key={label} className="bg-white shadow-lg rounded-lg p-4">
              <h2 className={`text-lg font-bold p-2 ${color}`}>{label}</h2>

              {(tasks[label.replace("📌", "").trim()] || []).length === 0 ? (
                <p className="text-gray-500 text-center">No tasks</p>
              ) : (
                tasks[label.replace("📌", "").trim()].map((task, index) => (
                  <div key={index} className="border p-3 mb-2 rounded flex justify-between items-center bg-gray-50 shadow-md">
                    <span>{task}</span>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow-md transition-all duration-300 hover:bg-yellow-600 active:scale-95"
                        onClick={() => editTask(label.replace("📌", "").trim(), index)}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg shadow-md transition-all duration-300 hover:bg-red-600 active:scale-95"
                        onClick={() => deleteTask(label.replace("📌", "").trim(), index)}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}