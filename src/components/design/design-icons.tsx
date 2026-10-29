//* Libraries imports
import type { ReactNode, SVGProps } from "react"

//* Inline SVG icon set: 24 grid, 2.5–3px square-capped strokes, currentColor

type IconDefinition = {
  strokeWidth: number
  square?: boolean
  paths: ReactNode
}

const icons = {
  seta: {
    strokeWidth: 3,
    paths: <path d="M4 12h15M13 5l7 7-7 7" />,
  },
  voltar: {
    strokeWidth: 3,
    paths: <path d="M20 12H5M11 5l-7 7 7 7" />,
  },
  relógio: {
    strokeWidth: 3,
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  martelo: {
    strokeWidth: 2.5,
    paths: (
      <>
        <path d="M13 2l8 8-3 3-8-8z" />
        <path d="M11.5 9.5L4 17l3 3 7.5-7.5" />
        <path d="M3 22h10" />
      </>
    ),
  },
  carta: {
    strokeWidth: 2.5,
    paths: (
      <>
        <rect x="5" y="2" width="14" height="20" />
        <circle cx="12" cy="11" r="3.5" />
        <path d="M9 18h6" />
      </>
    ),
  },
  sino: {
    strokeWidth: 3,
    paths: (
      <>
        <path d="M6 9a6 6 0 0 1 12 0c0 6 3 8 3 8H3s3-2 3-8" />
        <path d="M10 21h4" />
      </>
    ),
  },
  cadeado: {
    strokeWidth: 3,
    paths: (
      <>
        <rect x="4" y="11" width="16" height="10" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  },
  carteira: {
    strokeWidth: 2.5,
    paths: (
      <>
        <path d="M3 7h16v13H3z" />
        <path d="M3 7l12-4v4" />
        <path d="M15 13h3" />
      </>
    ),
  },
  olho: {
    strokeWidth: 2.5,
    paths: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  check: {
    strokeWidth: 3.5,
    paths: <path d="M4 12l5 5L20 6" />,
  },
  fechar: {
    strokeWidth: 3.5,
    paths: <path d="M6 6l12 12M18 6L6 18" />,
  },
  mais: {
    strokeWidth: 3,
    paths: <path d="M12 5v14M5 12h14" />,
  },
  sacar: {
    strokeWidth: 3,
    paths: <path d="M12 19V5M6 11l6-6 6 6" />,
  },
  sol: {
    strokeWidth: 2.5,
    paths: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  lua: {
    strokeWidth: 2.5,
    paths: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  },
  instagram: {
    strokeWidth: 2.5,
    square: false,
    paths: (
      <>
        <rect x="3" y="3" width="18" height="18" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  youtube: {
    strokeWidth: 2.5,
    square: false,
    paths: (
      <>
        <rect x="2" y="5" width="20" height="14" />
        <path d="M10 9l5 3-5 3z" />
      </>
    ),
  },
} satisfies Record<string, IconDefinition>

type DesignIconName = keyof typeof icons

/** Icons shown in the "Ícones" catalog (the close icon is used only in "Voz"). */
export const catalogIcons = (Object.keys(icons) as DesignIconName[]).filter(
  (name) => name !== "fechar"
)

type DesignIconProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  name: DesignIconName
  size?: number
  strokeWidth?: number
}

export function DesignIcon({
  name,
  size = 24,
  strokeWidth,
  ...props
}: DesignIconProps) {
  const icon: IconDefinition = icons[name]

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? icon.strokeWidth}
      strokeLinecap={icon.square === false ? undefined : "square"}
      {...props}
    >
      {icon.paths}
    </svg>
  )
}
