//* Node imports
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

export type StructureMismatch = {
  path: string
  reason: string
}

type MessageMismatch = StructureMismatch & {
  file: string
}

function describeType(value: unknown) {
  if (value === null) {
    return "null"
  }

  if (Array.isArray(value)) {
    return "array"
  }

  return typeof value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function joinPath(parent: string, key: string) {
  return parent ? `${parent}.${key}` : key
}

export function compareStructure(
  source: unknown,
  candidate: unknown,
  pathName = ""
): StructureMismatch[] {
  if (Array.isArray(source) || Array.isArray(candidate)) {
    if (!Array.isArray(source) || !Array.isArray(candidate)) {
      return [
        {
          path: pathName || "$",
          reason: `expected ${describeType(source)} but received ${describeType(candidate)}`,
        },
      ]
    }

    const mismatches: StructureMismatch[] = []

    if (source.length !== candidate.length) {
      mismatches.push({
        path: pathName || "$",
        reason: `expected array length ${source.length} but received ${candidate.length}`,
      })
    }

    const sharedLength = Math.min(source.length, candidate.length)

    for (let index = 0; index < sharedLength; index += 1) {
      mismatches.push(
        ...compareStructure(
          source[index],
          candidate[index],
          `${pathName}[${index}]`
        )
      )
    }

    return mismatches
  }

  if (isRecord(source) || isRecord(candidate)) {
    if (!isRecord(source) || !isRecord(candidate)) {
      return [
        {
          path: pathName || "$",
          reason: `expected ${describeType(source)} but received ${describeType(candidate)}`,
        },
      ]
    }

    const mismatches: StructureMismatch[] = []

    for (const key of Object.keys(source)) {
      if (!Object.hasOwn(candidate, key)) {
        mismatches.push({
          path: joinPath(pathName, key),
          reason: "missing key",
        })
      }
    }

    for (const key of Object.keys(candidate)) {
      if (!Object.hasOwn(source, key)) {
        mismatches.push({
          path: joinPath(pathName, key),
          reason: "unexpected key",
        })
      }
    }

    for (const key of Object.keys(source)) {
      if (Object.hasOwn(candidate, key)) {
        mismatches.push(
          ...compareStructure(
            source[key],
            candidate[key],
            joinPath(pathName, key)
          )
        )
      }
    }

    return mismatches
  }

  if (describeType(source) !== describeType(candidate)) {
    return [
      {
        path: pathName || "$",
        reason: `expected ${describeType(source)} but received ${describeType(candidate)}`,
      },
    ]
  }

  return []
}

async function collectMismatches() {
  const messagesDir = path.resolve(process.cwd(), "messages")
  const source = JSON.parse(
    await readFile(path.join(messagesDir, "en.json"), "utf8")
  ) as unknown
  const files = (await readdir(messagesDir)).filter((file) =>
    file.endsWith(".json")
  )
  const mismatches: MessageMismatch[] = []

  for (const file of files) {
    if (file === "en.json") {
      continue
    }

    const candidate = JSON.parse(
      await readFile(path.join(messagesDir, file), "utf8")
    ) as unknown

    for (const mismatch of compareStructure(source, candidate)) {
      mismatches.push({ file, ...mismatch })
    }
  }

  return mismatches
}

function isDirectExecution() {
  const entry = process.argv[1]

  if (!entry) {
    return false
  }

  return import.meta.url === pathToFileURL(entry).href
}

if (isDirectExecution()) {
  const mismatches = await collectMismatches()

  if (mismatches.length > 0) {
    for (const mismatch of mismatches) {
      console.error(`${mismatch.file} ${mismatch.path}: ${mismatch.reason}`)
    }

    process.exitCode = 1
  }
}
