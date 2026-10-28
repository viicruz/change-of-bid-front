//* Components imports
import { catalogIcons, DesignIcon } from "@/src/components/design/design-icons"
import { Code, DesignSection } from "@/src/components/design/design-primitives"

export function IconsSection() {
  return (
    <DesignSection
      id="icones"
      number="05"
      title="Ícones"
      className="gap-7"
      description={
        <>
          SVG inline, grade de 24, traço de 2,5–3px com pontas quadradas (
          <Code>stroke-linecap: square</Code>) e <Code>currentColor</Code>. Nada
          de emoji. Decorativos levam <Code>aria-hidden</Code>.
        </>
      }
    >
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-0">
        {catalogIcons.map((name) => (
          <li
            key={name}
            className="flex flex-col items-center gap-2.5 border-3 border-(--field-edge) bg-(--surface) px-2 py-4"
          >
            <DesignIcon name={name} size={32} />
            <span className="text-xs font-bold">{name}</span>
          </li>
        ))}
      </ul>
    </DesignSection>
  )
}
