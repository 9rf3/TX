"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCourses } from "@/lib/hooks/useCourses";
import { useCategories } from "@/lib/hooks/useCategories";
import { useStorage } from "@/lib/hooks/useStorage";
import { useRequireRole, ROLES } from "@/lib/role-utils";
import {
  ArrowLeft, BookOpen, Plus, Trash2,
  Film, Link as LinkIcon, Upload, Check, X, ChevronUp, ChevronDown
} from "lucide-react";

interface ModuleForm {
  title: string;
  description: string;
  video_type: 'upload' | 'external' | 'none';
  video_url: string;
  duration: number;
}

const emptyModule = (): ModuleForm => ({
  title: "", description: "", video_type: "none", video_url: "", duration: 0
});

export default function CreateCoursePage() {
  const { isAuthorized, isLoading: isRoleLoading } = useRequireRole([ROLES.ADMIN]);
  const router = useRouter();
  const { createCourse, isLoading: isCourseLoading } = useCourses();
  const { categories } = useCategories();
  const { uploadFile, isUploading: isUploadingFile } = useStorage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("free");
  const [level, setLevel] = useState("beginner");
  const [published, setPublished] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [saving, setSaving] = useState(false);

  const addModule = () => setModules(prev => [...prev, emptyModule()]);
  const removeModule = (i: number) => setModules(prev => prev.filter((_, idx) => idx !== i));

  const updateModule = (i: number, field: keyof ModuleForm, value: string | number | boolean) => {
    setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const moveModule = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= modules.length) return;
    setModules(prev => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const [uploadingModuleIdx, setUploadingModuleIdx] = useState<number | null>(null);

  const handleVideoUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File too large. Max 500MB.");
      return;
    }
    setUploadingModuleIdx(index);
    try {
      const path = `courses/${Date.now()}/${file.name}`;
      const { publicUrl } = await uploadFile('course-videos', file, path);
      updateModule(index, 'video_url', publicUrl);
      updateModule(index, 'video_type', 'upload');
    } catch {
      alert("Upload failed");
    } finally {
      setUploadingModuleIdx(null);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { alert("Course title is required"); return; }

    setSaving(true);
    try {
      let thumbnailUrl: string | null = null;
      if (thumbnail) {
        const ext = thumbnail.name.split('.').pop();
        const thumbPath = `courses/${Date.now()}/thumbnail.${ext}`;
        const result = await uploadFile('course-thumbnails', thumbnail, thumbPath);
        thumbnailUrl = result.publicUrl;
      }

      const course = await createCourse({
        title: title.trim(),
        description: description.trim(),
        category: categories.find(c => c.id === categoryId)?.name || categoryId,
        price,
        level,
        published,
        thumbnail: thumbnailUrl,
        gradient: null,
      });

      if (modules.some(m => m.title.trim())) {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        for (let i = 0; i < modules.length; i++) {
          const m = modules[i];
          if (!m.title.trim()) continue;
          const { error } = await supabase.from("course_modules").insert([{
            course_id: course.id,
            title: m.title.trim(),
            description: m.description.trim() || null,
            video_url: m.video_url || null,
            video_type: m.video_type,
            duration: m.duration || 0,
            order_index: i,
          }]);
          if (error) console.error("Failed to create module:", error);
        }
      }

      router.push("/admin/courses");
      router.refresh();
    } catch {
      alert("Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  if (isRoleLoading || !isAuthorized) {
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-primary" /> Create Course
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <h2 className="text-lg font-bold mb-6">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-light font-medium">Course Title *</label>
              <input required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Advanced React Patterns"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-light font-medium">Description *</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe what students will learn..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-light font-medium">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-light font-medium">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-light font-medium">Price</label>
              <select value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="free">Free</option>
                <option value="9.99">$9.99</option>
                <option value="19.99">$19.99</option>
                <option value="29.99">$29.99</option>
                <option value="49.99">$49.99</option>
                <option value="99.99">$99.99</option>
              </select>
            </div>
            <div className="space-y-1 flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary"
                />
                <span className="text-sm font-medium">Publish immediately</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Thumbnail */}
        <Card>
          <h2 className="text-lg font-bold mb-4">Thumbnail Image</h2>
          <div className="flex items-start gap-4">
            <div className="w-40 h-24 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <Upload className="w-5 h-5 text-muted mx-auto mb-1" />
                  <span className="text-[10px] text-muted">Preview</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer inline-block">
                <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Choose Image
                </span>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted mt-2">Recommended: 1280x720, max 2MB</p>
            </div>
          </div>
        </Card>

        {/* Modules / Lessons */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Course Modules</h2>
            <Button type="button" size="sm" variant="ghost" onClick={addModule}>
              <Plus className="w-4 h-4 mr-1" /> Add Module
            </Button>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <Film className="w-10 h-10 text-muted/30 mx-auto mb-3" />
              <p className="text-sm">No modules yet. Add your first lesson module.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, i) => (
                <Card key={i} className="border border-white/10 relative">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 pt-2">
                      <button type="button" onClick={() => moveModule(i, -1)} disabled={i === 0}
                        className="p-0.5 rounded text-muted hover:text-foreground disabled:opacity-30 cursor-pointer">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-muted text-center font-mono">{i + 1}</span>
                      <button type="button" onClick={() => moveModule(i, 1)} disabled={i === modules.length - 1}
                        className="p-0.5 rounded text-muted hover:text-foreground disabled:opacity-30 cursor-pointer">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs text-muted-light">Module Title *</label>
                          <input value={mod.title} onChange={e => updateModule(i, 'title', e.target.value)}
                            placeholder="e.g. Introduction to React"
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs text-muted-light">Description</label>
                          <textarea value={mod.description} onChange={e => updateModule(i, 'description', e.target.value)}
                            placeholder="Brief overview of this module..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-light">Video Source</label>
                          <select value={mod.video_type} onChange={e => updateModule(i, 'video_type', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
                          >
                            <option value="none">No Video</option>
                            <option value="upload">Upload Video</option>
                            <option value="external">External Link</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-light">Duration (minutes)</label>
                          <input type="number" min={0} value={mod.duration || ""} onChange={e => updateModule(i, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                        {mod.video_type === 'external' && (
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs text-muted-light">Video URL (YouTube, Vimeo, etc.)</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input value={mod.video_url} onChange={e => updateModule(i, 'video_url', e.target.value)}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {mod.video_type === 'upload' && (
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs text-muted-light">Upload Video</label>
                            {mod.video_url ? (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
                                <Check className="w-4 h-4 text-accent-green" />
                                <span className="text-sm text-muted-light truncate flex-1">Video uploaded</span>
                                <button type="button" onClick={() => { updateModule(i, 'video_url', ''); updateModule(i, 'video_type', 'none'); }}
                                  className="p-1 rounded text-muted hover:text-accent-red cursor-pointer">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-block">
                                <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                                  {uploadingModuleIdx === i ? (
                                    <>Uploading...</>
                                  ) : (
                                    <><Upload className="w-4 h-4" /> Select Video</>
                                  )}
                                </span>
                                <input type="file" accept="video/mp4,video/mov,video/webm,video/quicktime"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleVideoUpload(i, file);
                                  }}
                                  className="hidden" disabled={uploadingModuleIdx !== null}
                                />
                              </label>
                            )}
                            <p className="text-xs text-muted mt-1">Supported: MP4, MOV, WebM. Max 500MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeModule(i)}
                      className="p-1.5 rounded-lg text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors mt-1 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/admin/courses">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving || isUploadingFile}>
            {saving ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}
