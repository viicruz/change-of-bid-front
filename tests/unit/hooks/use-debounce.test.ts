// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Hooks imports
import { useDebounce } from "@/src/hooks/use-debounce"

const delayMs = 300

function DebouncedOutput(props: { value: string; delayMs: number }) {
  const debouncedValue = useDebounce(props.value, props.delayMs)

  return createElement("output", null, debouncedValue)
}

describe("useDebounce", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  function renderDebounced(value: string) {
    act(() => {
      root.render(createElement(DebouncedOutput, { value, delayMs }))
    })
  }

  it("returns the latest value after the delay", () => {
    renderDebounced("Blue")

    expect(container.textContent).toBe("Blue")

    renderDebounced("Blue-Eyes")

    expect(container.textContent).toBe("Blue")

    act(() => {
      vi.advanceTimersByTime(delayMs - 1)
    })

    expect(container.textContent).toBe("Blue")

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(container.textContent).toBe("Blue-Eyes")
  })

  it("restarts the delay when the value changes again", () => {
    renderDebounced("Blue")
    renderDebounced("Blue-")

    act(() => {
      vi.advanceTimersByTime(200)
    })

    renderDebounced("Blue-Eyes")

    expect(container.textContent).toBe("Blue")

    act(() => {
      vi.advanceTimersByTime(delayMs - 1)
    })

    expect(container.textContent).toBe("Blue")

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(container.textContent).toBe("Blue-Eyes")
  })
})
