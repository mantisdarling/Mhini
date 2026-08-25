import { projects as profileProjects } from "@/data/profileData";

export type DisplayProject = {
  id: string | number;
  title?: string;
  name?: string;
  category?: string;
  status?: string;
  role?: string;
  description: string;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  projectUrl?: string | null;
  tags: string[];
  tagline?: string;
  problem?: string;
  solution?: string;
  highlights?: string[];
  githubUrl?: string;
  liveUrl?: string;
};

export const ASSETS = {
  hero:
    import.meta.env.VITE_HERO_ASSET_URL ||
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/LzfUFsJmwAEdqRuc.jpg",
  mark:
    import.meta.env.VITE_MARK_ASSET_URL ||
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/SzCbbuLdJOszlBMq.webp",
  caseStudy:
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/USqfDrBUsSRPObfw.webp",
  stackBackdrop:
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/GUhrgvfWzLexkMAI.jpg",
  story: {
    motion:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/dXOMgdKzODAwcXzG.webp",
    blade:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/mLkdLUoOCQEUGqpn.webp",
    descent:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/CVLSXMjGiZyuLzmm.webp",
    stillness:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/QhtLfdSjMUvuXRLv.webp",
    finalFrame:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/DDtXMipemsimcRFJ.webp",
    heroVideo:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/dQgTwaCcLKHSusnt.mp4",
    closingVideo:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/qPIGKaMzyrRrveJB.mp4",
    heroPoster:
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/DqFlWdeJBdeaAsZf.webp",
    mobile: {
      finalFrame:
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/TWsZPXtLopGlIkYr.webp",
      motion:
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/sTadKupcVFDwguav.webp",
      blade:
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/FTbPLbavzYQOssdo.webp",
      descent:
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/nUUmQGGwbuDjMqAD.webp",
      stillness:
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/prTZlVLRoZCIcWHZ.webp",
      caseStudy:
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/yobFGNuwyHwrFsAO.webp",
    },
  },
} as const;

export const resumeProjects: DisplayProject[] = profileProjects.map(
  (project, index) => ({
    ...project,
    id: project.id,
    title: project.name,
    category: project.role
      ? `${project.status} / ${project.role}`
      : project.status,
    imageUrl: index === 0 ? ASSETS.caseStudy : null,
    mobileImageUrl: index === 0 ? ASSETS.story.mobile.caseStudy : null,
    projectUrl: project.liveUrl ?? project.githubUrl ?? null,
    tags: [...project.technologies],
  })
);

export type ChapterItem = {
  number: string;
  label: string;
  id: string;
};

export const chapterItems: readonly ChapterItem[] = [
  { number: "01", label: "Profile", id: "profile" },
  { number: "02", label: "Work", id: "work" },
  { number: "03", label: "Stack", id: "stack" },
  { number: "04", label: "Evidence", id: "evidence" },
  { number: "05", label: "Contact", id: "contact" },
];

export const navItems = chapterItems.map(
  ({ label, id }) => [label, id] as const
);

export function safeExternalUrl(href?: string | null) {
  if (!href) return null;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
