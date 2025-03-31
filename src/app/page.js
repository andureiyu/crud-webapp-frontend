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

  // Export tasks to CSV
  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push("Category,Task"); // Add headers

    // Convert tasks object to CSV rows
    Object.keys(tasks).forEach((category) => {
      tasks[category].forEach((task) => {
        csvRows.push(`${category},"${task}"`);
      });
    });

    // Create a CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob and downloadable link
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.csv";
    a.click();
    URL.revokeObjectURL(url); // Clean up
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row min-h-screen"
      initial={{ opacity: 0, y: -50 }} // Start with opacity 0 and slide in from above
      animate={{ opacity: 1, y: 0 }} // Animate to full opacity and original position
      exit={{ opacity: 0, y: -50 }} // Optional: Slide out upwards with fade-out
      transition={{
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99], // Custom bounce easing
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 font-poppins text-center md:text-left md:ml-20">
          Board View
        </h1>

        {/* Task Input Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full mb-6">
          <textarea
            className="w-full border rounded p-2 mb-2 resize-none h-24"
            placeholder="Enter task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />

          {/* Dropdown */}
          <div className="relative w-full">
            <motion.div
              className="w-full border rounded p-2 mb-4 cursor-pointer bg-white shadow-md flex justify-between items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className={`font-semibold ${
                  categories.find((cat) => cat.label.includes(taskCategory))?.color
                }`}
              >
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

          {/* Add Task Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 hover:from-lightgreen-600 hover:to-lightgreen-700 active:scale-95"
            onClick={addTask}
          >
            {editingIndex !== null ? "Update Task" : "Create Task"}
          </motion.button>
        </div>

        {/* Export to CSV Button */}
        <div className="flex justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.1}}
            whileTap={{ scale: 0.9}}
            onClick={exportToCSV}
            className="bg-yellow-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:bg-[#fe8f2d] active:scale-95"
          >
            Export to CSV
          </motion.button>
        </div>

        {/* Task Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ label, color }) => (
            <div key={label} className="bg-white shadow-lg rounded-lg p-4">
              <h2 className={`text-lg font-bold p-2 ${color}`}>{label}</h2>

              <AnimatePresence>
                {(tasks[label.replace("📌", "").trim()] || []).length === 0 ? (
                  <motion.p
                    className="text-gray-500 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    No tasks
                  </motion.p>
                ) : (
                  tasks[label.replace("📌", "").trim()].map((task, index) => (
                    <motion.div
                      key={index}
                      className="border p-3 mb-2 rounded flex justify-between items-center bg-gray-50 shadow-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
