"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const [selectedTask, setSelectedTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("Pending");
  const [schedules, setSchedules] = useState([]);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState(null);

  const users = ["User 1", "User 2", "User 3"]; // Example users for dropdown

  const categories = [
    { label: "Not Yet 📌", color: "text-red-500" },
    { label: "Needed 📌", color: "text-yellow-500" },
    { label: "Totally Needed 📌", color: "text-blue-500" },
  ];

  // Load tasks and schedules from local storage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedSchedules = localStorage.getItem("schedules");
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save schedules to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("schedules", JSON.stringify(schedules));
  }, [schedules]);

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

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push("Category,Task");

    Object.keys(tasks).forEach((category) => {
      tasks[category].forEach((task) => {
        csvRows.push(`${category},"${task}"`);
      });
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addSchedule = () => {
    if (!selectedTask || !assignedTo || !date || !time) return;

    const newSchedule = {
      taskName: selectedTask,
      assignedTo,
      date,
      time,
      status,
    };

    if (editingScheduleIndex !== null) {
      setSchedules((prev) =>
        prev.map((schedule, index) =>
          index === editingScheduleIndex ? newSchedule : schedule
        )
      );
      setEditingScheduleIndex(null);
    } else {
      setSchedules((prev) => [...prev, newSchedule]);
    }

    setSelectedTask("");
    setAssignedTo("");
    setDate("");
    setTime("");
    setStatus("Pending");
  };

  const editSchedule = (index) => {
    const schedule = schedules[index];
    setSelectedTask(schedule.taskName);
    setAssignedTo(schedule.assignedTo);
    setDate(schedule.date);
    setTime(schedule.time);
    setStatus(schedule.status);
    setEditingScheduleIndex(index);
  };

  const deleteSchedule = (index) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const exportSchedulesToCSV = () => {
    const csvRows = [];
    csvRows.push("Task Name,Assigned To,Date,Time,Status");

    schedules.forEach((schedule) => {
      csvRows.push(
        `${schedule.taskName},${schedule.assignedTo},${schedule.date},${schedule.time},${schedule.status}`
      );
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedules.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSchedulesFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      const rows = csvData.split("\n").slice(1); // Skip the header row
      const importedSchedules = rows
        .map((row) => {
          const [taskName, assignedTo, date, time, status] = row.split(",");
          if (!taskName || !assignedTo || !date || !time || !status) return null;
          return { taskName, assignedTo, date, time, status };
        })
        .filter(Boolean); // Remove invalid rows

      setSchedules((prev) => [...prev, ...importedSchedules]);
    };

    reader.readAsText(file);
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
    >
      <div className="flex-1 bg-gray-100 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 font-poppins text-center">
          Board View
        </h1>

        {/* Task Management Section */}
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

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 hover:from-lightgreen-600 hover:to-lightgreen-700 active:scale-95"
            onClick={addTask}
          >
            {editingIndex !== null ? "Update Task" : "Create Task"}
          </motion.button>
        </div>

        {/* Task Display Section */}
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

        <div className="flex justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={exportToCSV}
            className="bg-yellow-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:bg-[#fe8f2d] active:scale-95"
          >
            Export Tasks to CSV
          </motion.button>
        </div>

        {/* Scheduling Feature */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full mt-8">
          <h2 className="text-2xl font-bold mb-4">Book a Schedule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Task Name</label>
              <select
                className="w-full border rounded p-2"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">Select Task</option>
                {Object.keys(tasks).map((category) =>
                  tasks[category].map((task, index) => (
                    <option key={`${category}-${index}`} value={task}>
                      {task}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <select
                className="w-full border rounded p-2"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 active:scale-95"
            onClick={addSchedule}
          >
            {editingScheduleIndex !== null ? "Update Schedule" : "Add Schedule"}
          </motion.button>

          <div className="flex justify-center mt-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={exportSchedulesToCSV}
              className="bg-yellow-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:bg-[#fe8f2d] active:scale-95"
            >
              Export Schedules to CSV
            </motion.button>
          </div>

          <div className="flex justify-center mt-6">
            <label
              htmlFor="import-csv"
              className="bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:bg-blue-600 active:scale-95 cursor-pointer"
            >
              Import Schedules from CSV
            </label>
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={importSchedulesFromCSV}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Scheduled Tasks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  className="border p-3 rounded flex flex-col bg-gray-50 shadow-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>
                    <strong>Task:</strong> {schedule.taskName}
                  </p>
                  <p>
                    <strong>Assigned To:</strong> {schedule.assignedTo}
                  </p>
                  <p>
                    <strong>Date:</strong> {schedule.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {schedule.time}
                  </p>
                  <p>
                    <strong>Status:</strong> {schedule.status}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg shadow-md transition-all duration-300 hover:bg-yellow-600 active:scale-95"
                      onClick={() => editSchedule(index)}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg shadow-md transition-all duration-300 hover:bg-red-600 active:scale-95"
                      onClick={() => deleteSchedule(index)}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}