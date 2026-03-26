"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Project } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

const CARD_ACCENTS = ["from-indigo-500 to-violet-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600", "from-violet-500 to-purple-600"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try { const res = await api.get("/api/projects/"); setProjects(res.data.items); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProjects(); }, []);

  const openEdit = (p: Project) => { setEditId(p.id); setName(p.name); setDescription(p.description || ""); setShowModal(true); };
  const openCreate = () => { setEditId(null); setName(""); setDescription(""); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      editId ? await api.put(`/api/projects/${editId}`, { name, description }) : await api.post("/api/projects/", { name, description });
      setShowModal(false); fetchProjects();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try { await api.delete(`/api/projects/${id}`); fetchProjects(); }
    catch (err) { console.error(err); }
  };

  const inputCls = "w-full bg-[#0f1117] border border-[#2a3048] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition";

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            {!loading && `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {user?.role === "admin" && (
          <button onClick={openCreate}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#161b27] border border-[#2a3048] rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#161b27] border border-[#2a3048] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <p className="text-slate-300 font-semibold">No projects yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const canEditOrDelete = user?.role === "admin" || project.created_by === user?.id;
            return (
              <div key={project.id}
                className="bg-[#161b27] border border-[#2a3048] rounded-2xl p-5 flex flex-col hover:border-indigo-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
                {/* Color stripe */}
                <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${CARD_ACCENTS[i % CARD_ACCENTS.length]} mb-4`} />
                <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{project.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed flex-1 line-clamp-3">
                  {project.description || "No description provided for this project."}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#2a3048]">
                  <span className="text-[11px] text-slate-600 font-mono bg-indigo-500/8 px-2 py-0.5 rounded-md">
                    #{project.id}
                  </span>
                  {canEditOrDelete && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(project)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(project.id)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/8 hover:bg-red-500/15 px-2.5 py-1 rounded-lg transition">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-[#161b27] border border-[#2a3048] rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">{editId ? "Edit Project" : "New Project"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="My Awesome Project" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className={inputCls} rows={4} placeholder="Describe this project…" style={{ resize: "vertical" }} />
              </div>
              <div className="flex gap-2.5 justify-end pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 border border-[#2a3048] hover:bg-[#1e2536] transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/20 transition">
                  {editId ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}