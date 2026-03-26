"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Task, Project, User } from "@/lib/types";

const statusColors = {
  todo: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  done: "bg-green-100 text-green-700 border-green-200",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        api.get("/api/projects/"),
        api.get("/api/users/?page_size=100") // get lots of users for dropdown
      ]);
      setProjects(projRes.data.items);
      setUsers(userRes.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = "/api/tasks/?";
      if (filterProject) url += `project_id=${filterProject}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterUser) url += `assigned_to=${filterUser}&`;
      
      const res = await api.get(url);
      setTasks(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filterProject, filterStatus, filterUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/tasks/", {
        title,
        description,
        project_id: parseInt(projectId),
        assigned_to: assignedTo ? parseInt(assignedTo) : null,
        due_date: dueDate || null,
      });
      setShowModal(false);
      setTitle(""); setDescription(""); setProjectId(""); setAssignedTo(""); setDueDate("");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignUser = async (taskId: number, userIdStr: string) => {
    try {
      if (!userIdStr) return;
      await api.patch(`/api/tasks/${taskId}/assign`, { assigned_to: parseInt(userIdStr) });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getProjectName = (id: number) => {
    const p = projects.find(p => p.id === id);
    return p ? p.name : "Unknown Project";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
        >
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-10"><p className="text-gray-500 animate-pulse">Loading tasks...</p></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
            <p className="text-gray-500">No tasks found matching these filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-5 py-4 text-left font-bold tracking-wider">Project & Title</th>
                <th className="px-5 py-4 text-left font-bold tracking-wider">Status</th>
                <th className="px-5 py-4 text-left font-bold tracking-wider">Due Date</th>
                <th className="px-5 py-4 text-left font-bold tracking-wider">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-800 text-base">{task.title}</p>
                    <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wide">
                        {getProjectName(task.project_id)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`border rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer transition shadow-sm hover:shadow ${statusColors[task.status]}`}
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-gray-500 font-medium">
                      {task.due_date || "—"}
                  </td>
                  <td className="px-5 py-4">
                     <select
                      value={task.assigned_to || ""}
                      onChange={(e) => handleAssignUser(task.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition"
                    >
                      <option value="" disabled>Unassigned</option>
                      {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-5 text-gray-800">Create New Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Project</label>
                    <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assignee</label>
                    <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}