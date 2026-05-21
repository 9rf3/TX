"use client";
import { memo } from "react";
import { FolderGit2, ExternalLink, GitBranch, Star, Code, Medal, Globe } from "lucide-react";
import { GamePanel, PanelHeader } from "@/components/ui/GamePanel";
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

interface PremiumPortfolioSectionProps {
  projects: Project[];
  certificates: Certificate[];
  githubRepos: GitHubRepo[];
}

export const PremiumPortfolioSection = memo(function PremiumPortfolioSection({
  projects, certificates, githubRepos,
}: PremiumPortfolioSectionProps) {
  const hasProjects = projects.length > 0;
  const hasGitHub = githubRepos.length > 0;
  const hasCerts = certificates.length > 0;
  const isEmpty = !hasProjects && !hasGitHub && !hasCerts;

  if (isEmpty) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {hasProjects && (
        <GamePanel>
          <PanelHeader
            icon={<FolderGit2 className="h-4 w-4" />}
            title="Portfolio"
            action={
              projects.some(p => p.github_url) && (
                <button className="flex items-center gap-1 text-xs font-black text-primary-light transition hover:text-white">
                  <GitBranch className="h-3.5 w-3.5" /> GitHub
                </button>
              )
            }
          />
          <div className="grid gap-3">
            {projects.map((item) => (
              <div key={item.id} className="rounded-[8px] border border-white/10 bg-black/18 p-4 transition hover:border-primary/30 hover:bg-white/[0.04]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-primary-light" />
                    <h3 className="text-sm font-black text-white">{item.title}</h3>
                  </div>
                  {item.project_url && (
                    <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-light shrink-0 hover:text-white transition-colors" />
                    </a>
                  )}
                </div>
                {item.description && (
                  <p className="mt-2 text-xs leading-5 text-muted-light">{item.description}</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] text-muted-light">{tag}</span>
                    ))}
                  </div>
                )}
                {item.github_url && (
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-light">
                    <a href={item.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                      <GitBranch className="h-3 w-3" /> View Code
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GamePanel>
      )}

      {hasGitHub && (
        <GamePanel>
          <PanelHeader
            icon={<GitBranch className="h-4 w-4" />}
            title="GitHub Repos"
          />
          <div className="grid gap-3">
            {githubRepos.slice(0, 4).map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[8px] border border-white/10 bg-black/18 p-4 transition hover:border-primary/30 hover:bg-white/[0.04] block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-light shrink-0" />
                    <h3 className="text-sm font-black text-white truncate">{repo.name}</h3>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-light shrink-0" />
                </div>
                {repo.description && (
                  <p className="mt-2 text-xs leading-5 text-muted-light line-clamp-2">{repo.description}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-light">
                  {repo.language && (
                    <span className="flex items-center gap-1"><Code className="h-3 w-3" /> {repo.language}</span>
                  )}
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stars}</span>
                </div>
              </a>
            ))}
          </div>
        </GamePanel>
      )}

      {hasCerts && (
        <GamePanel className={!hasProjects || !hasGitHub ? "lg:col-span-2" : ""}>
          <PanelHeader
            icon={<Medal className="h-4 w-4" />}
            title="Certificates"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.slice(0, 3).map((cert) => (
              <div key={cert.id} className="group relative overflow-hidden rounded-[8px] border border-white/10 bg-black/18 transition hover:border-primary/30">
                <div className="h-3 w-full bg-gradient-to-r from-primary to-secondary" />
                <div className="p-4">
                  <div className="text-sm font-black text-white">{cert.title}</div>
                  {cert.issuer && (
                    <div className="mt-1 text-xs text-muted-light">by {cert.issuer}</div>
                  )}
                  {cert.issued_at && (
                    <div className="mt-2 text-xs text-muted-light">
                      {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GamePanel>
      )}
    </div>
  );
});
