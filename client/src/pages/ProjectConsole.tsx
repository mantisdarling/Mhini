/**
 * Mantis design reminder: this private console is a calm instrument panel, not a generic admin screen.
 */
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUp, ExternalLink, Image as ImageIcon, Loader2, Pencil, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type ProjectDraft = {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  tags: string;
  status: "draft" | "published";
  sortOrder: number;
};

const blankDraft: ProjectDraft = {
  title: "",
  category: "",
  description: "",
  imageUrl: "",
  projectUrl: "",
  tags: "",
  status: "draft",
  sortOrder: 0,
};

export default function ProjectConsole() {
  return (
    <DashboardLayout>
      <ProjectConsoleContent />
    </DashboardLayout>
  );
}

function ProjectConsoleContent() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const isOwner = user?.role === "admin";
  const projectsQuery = trpc.projects.listPrivate.useQuery(undefined, { enabled: isOwner });
  const [draft, setDraft] = useState<ProjectDraft>(blankDraft);
  const [editingId, setEditingId] = useState<number | null>(null);

  const projects = projectsQuery.data ?? [];
  const nextOrder = useMemo(() => (projects.at(-1)?.sortOrder ?? 0) + 1, [projects]);
  const refresh = () => utils.projects.listPrivate.invalidate();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project recorded in the run log.");
      setDraft({ ...blankDraft, sortOrder: nextOrder + 1 });
      refresh();
    },
    onError: error => toast.error(error.message),
  });
  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project calibration saved.");
      setDraft({ ...blankDraft, sortOrder: nextOrder });
      setEditingId(null);
      refresh();
    },
    onError: error => toast.error(error.message),
  });
  const removeMutation = trpc.projects.remove.useMutation({
    onSuccess: () => {
      toast.success("Project removed from the run log.");
      refresh();
    },
    onError: error => toast.error(error.message),
  });
  const reorderMutation = trpc.projects.reorder.useMutation({
    onSuccess: refresh,
    onError: error => toast.error(error.message),
  });

  function updateDraft<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...draft,
      title: draft.title.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      imageUrl: draft.imageUrl.trim(),
      projectUrl: draft.projectUrl.trim(),
      tags: draft.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      sortOrder: draft.sortOrder || nextOrder,
    };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate(payload);
  }

  function editProject(project: (typeof projects)[number]) {
    setEditingId(project.id);
    setDraft({
      title: project.title,
      category: project.category,
      description: project.description,
      imageUrl: project.imageUrl ?? "",
      projectUrl: project.projectUrl ?? "",
      tags: project.tags.join(", "),
      status: project.status,
      sortOrder: project.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveProject(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderMutation.mutate({ items: reordered.map((project, position) => ({ id: project.id, sortOrder: position + 1 })) });
  }

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return null;
  if (!isOwner) {
    return (
      <section className="grid min-h-[65vh] place-items-center">
        <div className="max-w-md border border-border bg-card p-8 text-center">
          <ShieldCheck className="mx-auto mb-4 text-primary" size={28} />
          <p className="font-mono text-xs tracking-[0.18em] text-primary">ACCESS RESTRICTED</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Owner clearance required.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">This project console is reserved for the Mantis portfolio owner.</p>
        </div>
      </section>
    );
  }

  const submitting = createMutation.isPending || updateMutation.isPending;
  return (
    <div className="mx-auto max-w-6xl space-y-10 py-4">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[0.65rem] font-medium tracking-[0.18em] text-primary">M / 06 — PRIVATE PROJECT CONSOLE</p>
          <h1 className="project-console-heading">Control the<br /><span className="text-primary">run log.</span></h1>
        </div>
        <a href="/" className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs tracking-[0.1em] transition-colors hover:border-primary hover:text-primary">
          VIEW PUBLIC PORTFOLIO <ExternalLink size={14} />
        </a>
      </header>

      <section className="project-console-layout">
        <div className="border border-border bg-card/40 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.16em] text-primary">{editingId ? "EDIT PROJECT" : "NEW PROJECT"}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{editingId ? "Recalibrate entry" : "Log a new run"}</h2>
            </div>
            <ImageIcon size={22} className="text-muted-foreground" />
          </div>

          <form className="mt-7 grid gap-5" onSubmit={submitProject}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Project title"><Input value={draft.title} onChange={e => updateDraft("title", e.target.value)} placeholder="e.g. Signal / 24" required /></FormField>
              <FormField label="Category"><Input value={draft.category} onChange={e => updateDraft("category", e.target.value)} placeholder="e.g. Data platform" required /></FormField>
            </div>
            <FormField label="Case-study description"><Textarea value={draft.description} onChange={e => updateDraft("description", e.target.value)} placeholder="What changed because this project existed?" rows={5} required /></FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Cover image URL (optional)"><Input type="url" value={draft.imageUrl} onChange={e => updateDraft("imageUrl", e.target.value)} placeholder="https://…" /></FormField>
              <FormField label="Project URL (optional)"><Input type="url" value={draft.projectUrl} onChange={e => updateDraft("projectUrl", e.target.value)} placeholder="https://…" /></FormField>
            </div>
            <div className="project-console-form-grid">
              <FormField label="Tags, separated by commas"><Input value={draft.tags} onChange={e => updateDraft("tags", e.target.value)} placeholder="Strategy, Build, Launch" /></FormField>
              <FormField label="Status"><select className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary" value={draft.status} onChange={e => updateDraft("status", e.target.value as ProjectDraft["status"])}><option value="draft">Draft</option><option value="published">Published</option></select></FormField>
              <FormField label="Track position"><Input type="number" min="0" value={draft.sortOrder || ""} onChange={e => updateDraft("sortOrder", Number(e.target.value))} placeholder={String(nextOrder)} /></FormField>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="gap-2 rounded-none bg-primary px-5 font-mono text-xs tracking-[0.1em] hover:bg-primary/90">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : editingId ? <Save size={15} /> : <Plus size={15} />}
                {editingId ? "SAVE CALIBRATION" : "RECORD PROJECT"}
              </Button>
              {editingId && <Button type="button" variant="outline" className="rounded-none font-mono text-xs tracking-[0.1em]" onClick={() => { setEditingId(null); setDraft({ ...blankDraft, sortOrder: nextOrder }); }}>CANCEL</Button>}
              <p className="text-xs text-muted-foreground">Published entries appear on the public portfolio immediately.</p>
            </div>
          </form>
        </div>

        <aside className="border border-border bg-secondary/30 p-5 sm:p-7">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-primary">OPERATING NOTES</p>
          <div className="mt-5 space-y-5 text-sm leading-6 text-muted-foreground">
            <p>Each published project is automatically sorted by its <strong className="font-medium text-foreground">track position</strong> and shown in the public Track Record section.</p>
            <p>Keep a project as <strong className="font-medium text-foreground">draft</strong> while you gather a cover image, result, or destination link.</p>
            <p>Use a direct image URL for covers. A Manus storage URL is ideal for media you want to retain with this project.</p>
          </div>
          <div className="mt-8 border-t border-border pt-5 font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground">{projects.length.toString().padStart(2, "0")} TOTAL ENTRIES / {projects.filter(project => project.status === "published").length.toString().padStart(2, "0")} PUBLIC</div>
        </aside>
      </section>

      <section className="border-t border-border pt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="font-mono text-[0.62rem] tracking-[0.16em] text-primary">CURRENT RUN LOG</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Project entries</h2></div>
          {projectsQuery.isFetching && <Loader2 size={17} className="animate-spin text-muted-foreground" />}
        </div>
        {projectsQuery.isLoading ? <div className="grid min-h-48 place-items-center border border-border"><Loader2 className="animate-spin text-primary" /></div> : projects.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-14 text-center"><p className="font-mono text-xs tracking-[0.15em] text-primary">NO PROJECTS RECORDED</p><p className="mt-3 text-sm text-muted-foreground">Use the intake panel to add the first real project to your portfolio.</p></div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project, index) => (
              <article key={project.id} className="project-console-list-row">
                <div className="font-mono text-lg text-primary">{String(index + 1).padStart(2, "0")}</div>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-base font-medium">{project.title}</h3><span className={`border px-2 py-0.5 font-mono text-[0.55rem] tracking-[0.12em] ${project.status === "published" ? "border-primary/60 text-primary" : "border-border text-muted-foreground"}`}>{project.status.toUpperCase()}</span></div><p className="mt-1 truncate text-sm text-muted-foreground">{project.category} · {project.tags.join(" / ") || "No tags"}</p></div>
                <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0 || reorderMutation.isPending} onClick={() => moveProject(index, -1)} aria-label={`Move ${project.title} up`}><ArrowUp size={16} /></Button><Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === projects.length - 1 || reorderMutation.isPending} onClick={() => moveProject(index, 1)} aria-label={`Move ${project.title} down`}><ArrowDown size={16} /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editProject(project)} aria-label={`Edit ${project.title}`}><Pencil size={15} /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={removeMutation.isPending} onClick={() => { if (window.confirm(`Remove ${project.title} from the run log?`)) removeMutation.mutate({ id: project.id }); }} aria-label={`Delete ${project.title}`}><Trash2 size={15} /></Button></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground">{label.toUpperCase()}{children}</label>;
}
