import type { SVGProps } from "react";

export function MantisSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 420" role="img" aria-label="Mantis silhouette" {...props}>
      <circle className="mantis-sun" cx="160" cy="132" r="104" />
      <g className="mantis-figure">
        <path d="M159 108c-15 0-26 11-26 27s11 27 26 27 26-11 26-27-11-27-26-27Z" />
        <path d="M144 159h31l22 83-18 112h-28l-8-112 1-83Z" />
        <path d="M147 172 77 244l-33 7 36-28 43-75 24 24Z" />
        <path d="m172 172 71 72 33 7-36-28-43-75-25 24Z" />
        <path d="m145 218-53 119 20 5 55-93-22-31Z" />
        <path d="m175 218 53 119-20 5-55-93 22-31Z" />
        <path className="mantis-blade" d="M87 248 34 207l-21 5 47 50 27-14Z" />
        <path className="mantis-blade" d="m232 248 53-41 21 5-47 50-27-14Z" />
        <path className="mantis-antenna" d="M145 116C113 77 82 74 58 91M174 116c32-39 63-42 87-25" />
      </g>
    </svg>
  );
}
