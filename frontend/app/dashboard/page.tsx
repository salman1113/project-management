"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Project } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/api/projects/");
      setProjects(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openEdit = (p: Project) => {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setShowModal(true);
  };

  const openCreate = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/projects/${editId}`, { name, description });
      } else {
        await api.post("/api/projects/", { name, description });
      }
      setShowModal(false);
      setName("");
      setDescription("");
      setEditId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
        >
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10"><p className="text-gray-500 animate-pulse">Loading projects...</p></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
            <p className="text-gray-500">No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const canEditOrDelete = user?.role === "admin" || project.created_by === user?.id;
            
            return (
              <div key={project.id} className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-4 line-clamp-3 min-h-[60px]">
                      {project.description || "No description provided for this project."}
                    </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">ID: {project.id}</span>
                  
                  {canEditOrDelete && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => openEdit(project)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
                      >
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

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-5 text-gray-800">{editId ? "Edit Project" : "Create New Project"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition">
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