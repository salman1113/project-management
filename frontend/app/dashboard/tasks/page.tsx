"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Task, Project, User } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

const STATUS_STYLE: Record<string, string> = {
  todo:        "bg-slate-700/50 text-slate-300 border border-slate-600/50",
  in_progress: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  done:        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Todo", in_progress: "In Progress", done: "Done",
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([api.get("/api/projects/"), api.get("/api/users/?page_size=100")]);
      setProjects(projRes.data.items); setUsers(userRes.data.items);
    } catch (err) { console.error(err); }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = "/api/tasks/?";
      if (filterProject) url += `project_id=${filterProject}&`;
      if (filterStatus)  url += `status=${filterStatus}&`;
      if (filterUser)    url += `assigned_to=${filterUser}&`;
      const res = await api.get(url);
      setTasks(res.data.items);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchTasks(); }, [filterProject, filterStatus, filterUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/tasks/", {
        title, description,
        project_id: parseInt(projectId),
        assigned_to: assignedTo ? parseInt(assignedTo) : null,
        due_date: dueDate || null,
      });
      setShowModal(false);
      setTitle(""); setDescription(""); setProjectId(""); setAssignedTo(""); setDueDate("");
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    try { await api.patch(`/api/tasks/${taskId}/status`, { status }); fetchTasks(); }
    catch (err: any) { alert(err.response?.data?.detail || "Not authorized."); fetchTasks(); }
  };

  const handleAssignUser = async (taskId: number, userIdStr: string) => {
    if (!userIdStr) return;
    try { await api.patch(`/api/tasks/${taskId}/assign`, { assigned_to: parseInt(userIdStr) }); fetchTasks(); }
    catch (err: any) { alert(err.response?.data?.detail || "Not authorized."); fetchTasks(); }
  };

  const getProjectName = (id: number) => projects.find(p => p.id === id)?.name || "Unknown";

  const selectCls = "bg-[#161b27] border border-[#2a3048] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition cursor-pointer";
  const inputCls  = "w-full bg-[#0f1117] border border-[#2a3048] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition";

  const hasFilters = filterProject || filterStatus || filterUser;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            {!loading && `${tasks.length} task${tasks.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 bg-[#161b27] border border-[#2a3048] rounded-2xl px-4 py-3 mb-5">
        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold uppercase tracking-wider mr-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filters
        </div>
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={selectCls}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {user?.role === "admin" && (
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className={selectCls}>
            <option value="">All Assignees</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        {hasFilters && (
          <button onClick={() => { setFilterProject(""); setFilterStatus(""); setFilterUser(""); }}
            className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#2a3048] border-t-indigo-500 rounded-full mb-3"
            style={{ animation: "spin 0.8s linear infinite" }} />
          <p className="text-slate-500 text-sm">Loading tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#161b27] border border-[#2a3048] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <p className="text-slate-300 font-semibold">No tasks found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-[#161b27] border border-[#2a3048] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3048]">
                {["Task", "Status", "Due Date", "Assignee"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3048]/60">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-indigo-500/[0.03] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-200 text-sm mb-0.5">{task.title}</p>
                    <p className="text-[11px] text-indigo-400 font-medium uppercase tracking-wide">{getProjectName(task.project_id)}</p>
                  </td>
                  <td className="px-5 py-4">
                    {task.status === "done" ? (
                      <span className={`inline-block text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1.5 opacity-80 ${STATUS_STYLE.done}`}>
                        Done
                      </span>
                    ) : (
                      <select
                        disabled={user?.role !== "admin" && task.assigned_to !== user?.id}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1.5 cursor-pointer focus:outline-none disabled:cursor-default disabled:opacity-60 ${STATUS_STYLE[task.status] || STATUS_STYLE.todo}`}
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {task.due_date
                      ? <span className="text-slate-300 font-medium text-sm">{task.due_date}</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {user?.role === "admin" && task.status !== "done" ? (
                      <select value={task.assigned_to || ""} onChange={(e) => handleAssignUser(task.id, e.target.value)}
                        className={`${selectCls} max-w-40`}>
                        <option value="" disabled>Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {task.assigned_to ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {users.find(u => u.id === task.assigned_to)?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span className="text-sm font-medium text-slate-300">
                              {users.find(u => u.id === task.assigned_to)?.name || "Unknown"}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-600 text-sm">Unassigned</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-[#161b27] border border-[#2a3048] rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Task title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className={inputCls} rows={2} placeholder="Optional description…" style={{ resize: "vertical" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Project</label>
                  <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls} required>
                    <option value="">Select...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Assignee</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputCls}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
              </div>
              <div className="flex gap-2.5 justify-end pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 border border-[#2a3048] hover:bg-[#1e2536] transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/20 transition">
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