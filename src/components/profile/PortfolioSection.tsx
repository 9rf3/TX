"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2, ExternalLink, GitBranch, Trash2, Plus,
  Star, Code, Medal, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  tags: string[] | null;
  is_featured: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  image_url: string | null;
  issued_at: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
}

interface PortfolioSectionProps {
  projects: Project[];
  certificates: Certificate[];
  githubRepos: GitHubRepo[];
  onCreateProject: (data: { title: string; description?: string; project_url?: string; github_url?: string; tags?: string[] }) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onUploadCertificate: (formData: FormData) => Promise<void>;
  onRefresh: () => void;
}

export function PortfolioSection({
  projects, certificates, githubRepos,
  onCreateProject, onDeleteProject, onUploadCertificate, onRefresh,
}: PortfolioSectionProps) {
  const [tab, setTab] = useState<'projects' | 'github' | 'certificates'>('projects');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', project_url: '', github_url: '', tags: '' });
  const [creating, setCreating] = useState(false);
  const certFileRef = useState<HTMLInputElement | null>(null);

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) return;
    setCreating(true);
    try {
      await onCreateProject({
        title: newProject.title,
        description: newProject.description || undefined,
        project_url: newProject.project_url || undefined,
        github_url: newProject.github_url || undefined,
        tags: newProject.tags ? newProject.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      });
      setNewProject({ title: '', description: '', project_url: '', github_url: '', tags: '' });
      setShowNewProject(false);
      onRefresh();
    } catch {
      // handled by parent
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <FolderGit2 className="w-5 h-5 text-secondary" />
        Portfolio
      </h2>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-white/5 w-fit">
        {(['projects', 'github', 'certificates'] as const).map(t => (
          <motion.button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize",
              tab === t ? "bg-primary text-white" : "text-muted-light hover:text-white",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Add project button */}
            <motion.button
              onClick={() => setShowNewProject(!showNewProject)}
              className="flex items-center gap-2 text-xs text-primary-light hover:text-primary transition-colors"
              whileHover={{ x: 2 }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </motion.button>

            {/* New project form */}
            <AnimatePresence>
              {showNewProject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-border">
                    <input
                      value={newProject.title}
                      onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                      placeholder="Project title"
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted focus:border-primary/50 focus:outline-none"
                    />
                    <input
                      value={newProject.description}
                      onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                      placeholder="Short description"
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted focus:border-primary/50 focus:outline-none"
                    />
                    <input
                      value={newProject.project_url}
                      onChange={e => setNewProject(p => ({ ...p, project_url: e.target.value }))}
                      placeholder="Project URL (optional)"
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted focus:border-primary/50 focus:outline-none"
                    />
                    <input
                      value={newProject.github_url}
                      onChange={e => setNewProject(p => ({ ...p, github_url: e.target.value }))}
                      placeholder="GitHub URL (optional)"
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted focus:border-primary/50 focus:outline-none"
                    />
                    <input
                      value={newProject.tags}
                      onChange={e => setNewProject(p => ({ ...p, tags: e.target.value }))}
                      placeholder="Tags (comma separated)"
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder:text-muted focus:border-primary/50 focus:outline-none"
                    />
                    <motion.button
                      onClick={handleCreateProject}
                      disabled={creating || !newProject.title.trim()}
                      className="w-full py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Projects list */}
            {projects.length === 0 ? (
              <div className="text-center py-6">
                <FolderGit2 className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-xs text-muted-light">No projects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative rounded-xl border border-border/50 bg-white/5 p-4 group hover:border-border-light transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold">{project.title}</h3>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent-red transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {project.description && (
                      <p className="text-[11px] text-muted-light line-clamp-2 mb-2">{project.description}</p>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-muted">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-light hover:text-primary flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Live
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-light hover:text-white flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> Code
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'github' && (
          <motion.div
            key="github"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {githubRepos.length === 0 ? (
              <div className="text-center py-6">
                <GitBranch className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-xs text-muted-light">Link your GitHub to showcase repos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {githubRepos.map(repo => (
                  <a
                    key={repo.id}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-border/50 bg-white/5 p-4 hover:border-border-light transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold truncate flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-muted shrink-0" />
                        {repo.name}
                      </h3>
                      <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    {repo.description && (
                      <p className="text-[11px] text-muted-light line-clamp-2 mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" /> {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {repo.stars}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'certificates' && (
          <motion.div
            key="certificates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Upload certificate */}
            <label className="flex items-center gap-2 text-xs text-primary-light hover:text-primary transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Upload Certificate
              <input type="file" accept="image/*" className="hidden" />
            </label>

            {certificates.length === 0 ? (
              <div className="text-center py-6">
                <Medal className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-xs text-muted-light">No certificates yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certificates.map(cert => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-border/50 bg-white/5 p-3 text-center hover:border-border-light transition-all"
                  >
                    {cert.image_url ? (
                      <img src={cert.image_url} alt={cert.title} className="w-full aspect-[4/3] object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-2">
                        <Medal className="w-8 h-8 text-muted/30" />
                      </div>
                    )}
                    <div className="text-xs font-semibold truncate">{cert.title}</div>
                    {cert.issuer && (
                      <div className="text-[9px] text-muted truncate">{cert.issuer}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
