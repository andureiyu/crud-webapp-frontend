"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import Sidebar from "./sidebar";

export default function Dashboard() {
  const [tutors, setTutors] = useState([]); //tutors database array
  const [payments, setPayments] = useState([]); //payments database array
  const [schedules, setSchedules] = useState([]); //schedules database array
  const [sessionNotes, setSessionNotes] = useState([]); //session notes database array
  const [subjects, setSubjects] = useState([]); //subjects display database array
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



  function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getToday() {
  const d = new Date();
  return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
}

function CalendarWidget() {
  const today = getToday();
  const [month, setMonth] = useState(today.month);
  const [year, setYear] = useState(today.year);
  const daysInMonth = getDaysInMonth(month, year);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-2">
        <button
          className="px-2 text-gray-400 hover:text-gray-600"
          onClick={() => setMonth((m) => m === 0 ? 11 : m - 1)}
        >{"<"}</button>
        <span className="font-semibold">
          {new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          className="px-2 text-gray-400 hover:text-gray-600"
          onClick={() => setMonth((m) => m === 11 ? 0 : m + 1)}
        >{">"}</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs w-full">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="font-bold text-center">{d}</div>
        ))}
        {Array.from({length: new Date(year, month, 1).getDay()}).map((_, i) => (
          <div key={i} />
        ))}
        {Array.from({length: daysInMonth}).map((_, i) => {
          const isToday = today.day === i + 1 && today.month === month && today.year === year;
          return (
            <div
              key={i}
              className={`text-center rounded-full ${isToday ? "bg-[#5c49fc] text-white font-bold" : ""}`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}


useEffect(() => { //fetch tutor data from database
  fetch('/api/tutors')
    .then(res => res.json())
    .then(data => setTutors(data));
}, []);




useEffect(() => {
  fetch('/api/payments')
    .then(res => res.json())
    .then(data => {
      setPayments(Array.isArray(data) ? data : []);
    });
}, []);


useEffect(() => {
  fetch('/api/sessions')
    .then(res => res.json())
    .then(data => {
      // Transform session data to match your card fields
      const mapped = data.map(session => ({
        taskName: `Subject ${session.subject_id}`, 
        assignedTo: `Tutor ${session.tutor_id}`,   
        date: session.start_time.slice(0, 10),
        time: `${session.start_time.slice(11, 16)} - ${session.end_time.slice(11, 16)}`,
        status: session.status
      }));
      setSchedules(mapped);
    });
}, []);

useEffect(() => {
  fetch('/api/session-notes')
    .then(res => res.json())
    .then(data => setSessionNotes(Array.isArray(data) ? data : []));
}, []);


useEffect(() => {
  fetch('/api/tutors-with-subjects')
    .then(res => res.json())
    .then(data => setSubjects(Array.isArray(data) ? data : []));
}, []);

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
<div className="flex-1 p-4 sm:p-6">
  <h1 className="flex items-center justify-start gap-3 text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#000229] via-[#5c49fc] to-[#dddde4] bg-clip-text text-transparent">
  <span className="inline-block w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white shadow">
    <Image
      src="/images/tmicon.png"
      alt="TutorMo Logo"
      width={48}
      height={48}
      className="w-full h-full object-cover rounded-full"
      priority
    />
  </span>
  <span className="tracking-widest">tutorMo</span>
</h1>


<div className="flex flex-col lg:flex-row gap-8 w-full">
  {/* About Me Section - Left */}
  <section
    id="about-me"
    className="flex flex-col items-center justify-center px-4 sm:px-8 md:px-6 py-8 md:py-12 w-full lg:w-2/3 min-w-0"
  >
    <motion.div
      className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-[#bfbfc9] w-full min-w-0"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
    {/* Image Section */}
    <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-10 bg-gray-100 min-w-0">
      <Image
        src="/images/tutorMo.png"
        alt="A photo of Andrei Ninora"
        width={500}
        height={500}
        className="w-full h-auto object-contain rounded-lg"
      />
    </div>
    {/* Text Section */}
    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left min-w-0">
      <h3 className="text-2xl md:text-3xl font-bold mb-4 break-words">
  <span className="bg-gradient-to-r from-[#4285F4] via-[#DB4437] to-[#F4B400] bg-clip-text text-transparent">
    Hi
  </span>
  , Welcome to{' '}
  <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-40% via-[#FBBC05] via-70% to-[#34A853] bg-clip-text text-transparent">
    tutorMo
  </span>
  .
</h3>
      <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 break-words">
        A single page web application (SPA) featuring an online tutoring platform where students book tutoring sessions with instructors. We provide a simple and minimalist task manager that is open for everyone.
      </p>
      <p className="text-base md:text-lg text-gray-700 leading-relaxed break-words">
        Developed by Andrei Niñora, with groupmates: Shawny Macrohon & Hannah Veroy.
      </p>
      <div className="mt-6 flex justify-center md:justify-start">
        <button className="flex items-center gap-2 bg-black text-white font-medium px-6 py-3 rounded-md text-sm md:text-base hover:bg-gray-800 transition">
          Learn More About Me →
        </button>
      </div>
    </div>
  </motion.div>
</section>

{/* Widget Column - Right */}
  <div className="w-full lg:w-1/3 flex flex-col gap-4 mt-6 lg:mt-8">
    {/* Mini Calendar */}
    <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-[#5b638a]">
      <h3 className="font-bold text-lg mb-2 text-[#23265a]">Mini Calendar</h3>
      <CalendarWidget />
    </div>
   {/* Session Ratings Widget - replaces Task(s) Due Today */}
<div className="bg-yellow-50 rounded-lg shadow p-3 border-2 border-[#bfbfc9]">
  <h3 className="font-bold text-sm text-[#23265a] mb-1">Session Ratings</h3>
  <ul className="text-xs text-gray-700 list-disc pl-4">
    {sessionNotes.length === 0 ? (
      <li>No session ratings yet</li>
    ) : (
      sessionNotes.map((note) => (
        <li key={note.note_id}>
          <span className="font-medium">{note.content}</span>
          <span className="ml-1 text-[10px] text-gray-400">
            ({note.created_at.slice(0, 10)})
          </span>
        </li>
      ))
    )}
  </ul>
</div>
    {/* Study Tip */}
    <div className="bg-blue-50 rounded-lg shadow p-3 border-2 border-[#bfbfc9]">
      <h3 className="font-bold text-sm text-[#23265a] mb-1">Study Tip of the Day</h3>
      <p className="text-xs text-gray-700">
        {[
          "Break your study sessions into short, focused intervals.",
          "Review your notes regularly, not just before exams.",
          "Teach what you've learned to someone else.",
          "Use practice questions to test your understanding.",
          "Stay hydrated and take regular breaks!"
        ][new Date().getDate() % 5]}
      </p>
    </div>
  </div>
</div>

 {/* Payment Section */}

<div className="bg-white rounded-lg shadow-md p-4 my-4 w-full">
  <h2 className="text-xl font-bold mb-2 text-[#23265a]">Payment History</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Date</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Amount</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Method</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Status</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Platform Fee</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Tutor Payout</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Payout Date</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Refund Amount</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Refund Date</th>
          <th className="px-4 py-2 text-left font-semibold text-[#23265a]">Refund Reason</th>
        </tr>
      </thead>
      <tbody>
        {payments.length === 0 ? (
          <tr>
            <td colSpan={10} className="px-4 py-2 text-center text-gray-400">No payment records found.</td>
          </tr>
        ) : (
          payments.map((payment) => (
            <tr key={payment.payment_id}>
              <td className="px-4 py-2">{payment.payment_date?.slice(0, 10)}</td>
              <td className="px-4 py-2">{payment.amount}</td>
              <td className="px-4 py-2">{payment.payment_method}</td>
              <td className={`px-4 py-2 ${payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {payment.status}
              </td>
              <td className="px-4 py-2">{payment.platform_fee}</td>
              <td className="px-4 py-2">{payment.tutor_payout}</td>
              <td className="px-4 py-2">{payment.payout_date || 'N/A'}</td>
              <td className="px-4 py-2">{payment.refund_amount}</td>
              <td className="px-4 py-2">{payment.refund_date || 'N/A'}</td>
              <td className="px-4 py-2">{payment.refund_reason || 'N/A'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>


<h2 className="text-xl sm:text-2xl font-bold mb-4 text-left text-[#23265a]">
  Board View
</h2>

        {/* Task Management Section */}
        <div className="bg-[#efeded] shadow-lg rounded-lg p-4 w-full mb-6">
 
          <textarea
            className="w-full border rounded p-2 mb-2 resize-none h-24"
            placeholder="Enter task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />

          <div className="relative w-full">
            <motion.div
              className="w-full border rounded p-2 mb-4 cursor-pointer bg-[#efeded] shadow-md flex justify-between items-center"
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
            className="w-full bg-gradient-to-r from-[#000229] to-[#5b638a] text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 hover:from-[#23265a] hover:to-[#6b7bb3] active:scale-95"
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

 <div className="bg-white rounded-lg shadow-md p-4 my-4 w-full">
  <h2 className="text-xl font-bold mb-2 text-[#23265a]">Subjects</h2>
  {/* Categories as Tabs or Select */}
  <div className="mb-4">
    <select className="border rounded px-3 py-2 w-full md:w-auto">
      {/* map over categories */}
      <option>Mathematics</option>
      <option>Science</option>
      <option>Languages</option>
    </select>
  </div>
  {/* Subjects as Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {subjects.map(subject => (
      <div key={subject.subject_id} className="border rounded-lg p-3 shadow hover:shadow-lg transition flex flex-col">
        <h3 className="font-bold text-lg">{subject.name}</h3>
        <p className="text-sm text-gray-600 mb-2">Difficulty: {subject.difficulty_level}</p>
        <p className="text-xs text-gray-500 mb-2">{subject.description}</p>
        <p className="font-semibold mb-1">Tutors:</p>
        <ul className="mb-2">
          {subject.tutors.length === 0 ? (
            <li className="text-xs text-gray-400">No tutors for this subject</li>
          ) : (
            subject.tutors.map(tutor => (
              <li key={tutor.tutor_id} className="mb-1 flex items-center">
                <span className="text-sm">{tutor.users?.name || 'No Name'}</span>
              </li>
            ))
          )}
        </ul>
        <button className="bg-[#5b638a] text-white px-4 py-2 rounded hover:bg-[#23265a]">View Tutors</button>
      </div>
    ))}
  </div>
</div>


        {/* Scheduling Feature */}
        <div className="bg-[#efeded] shadow-lg rounded-lg p-4 w-full mt-8">
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
    <option value="">Select Tutor</option>
    {tutors.map((tutor) => (
      <option key={tutor.tutor_id} value={tutor.tutor_id}>
        {tutor.users.first_name} {tutor.users.last_name} ({tutor.users.email})
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
            className="w-full bg-[#5b638a] text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 active:scale-95"
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

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Booked Schedules</h3>
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