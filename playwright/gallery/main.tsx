/// <reference types="vite/client" />

//* Libraries imports
import { StrictMode, type ComponentType } from "react"
import { flushSync } from "react-dom"
import { createRoot, type Root } from "react-dom/client"

//* Styles imports
import "../../app/globals.css"

type StoryModule = Record<string, ComponentType<Record<string, unknown>>>

type MountParams = {
  story: string
  props?: Record<string, unknown>
}

declare global {
  interface Window {
    mount: (params: MountParams) => Promise<void>
    unmount: () => Promise<void>
  }
}

const stories = import.meta.glob<StoryModule>([
  "../../components/**/*.story.tsx",
  "../../app/**/*.story.tsx",
])

function storyPath(file: string) {
  return file.replace(/^(\.\.\/)+/, "").replace(/\.story\.\w+$/, "")
}

async function resolveStory(storyId: string) {
  const separator = storyId.lastIndexOf("/")
  const path = storyId.slice(0, separator)
  const name = storyId.slice(separator + 1)
  const file = Object.keys(stories).find((candidate) => {
    const id = storyPath(candidate)

    return id === path || id.endsWith(`/${path}`)
  })

  if (!file) {
    return undefined
  }

  const storyModule = await stories[file]()

  return storyModule[name] ?? storyModule.default
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Gallery root element was not found")
}

let root: Root | undefined

window.mount = async ({ story, props }) => {
  const Story = await resolveStory(story)

  if (!Story) {
    throw new Error(`Unknown story: ${story}`)
  }

  const activeRoot = (root ??= createRoot(rootElement))

  flushSync(() => {
    activeRoot.render(
      <StrictMode>
        <Story {...(props ?? {})} />
      </StrictMode>
    )
  })
}

window.unmount = async () => {
  root?.unmount()
  root = undefined
}
