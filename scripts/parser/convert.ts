import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseFileToThreads } from './parser'
import type { ParseError, Thread } from '../shared/domain'

const ROOT = process.cwd()
const INPUT_DIR = path.resolve(ROOT, 'input')
const OUTPUT_DIR = path.resolve(ROOT, 'public/data')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'threads.json')
const ERROR_FILE = path.join(OUTPUT_DIR, 'parse-errors.json')

const main = async (): Promise<void> => {
  const entries = await readdir(INPUT_DIR, { withFileTypes: true })
  const txtFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))

  const allThreads: Thread[] = []
  const allErrors: ParseError[] = []

  for (const fileName of txtFiles) {
    const filePath = path.join(INPUT_DIR, fileName)
    const content = await readFile(filePath, 'utf-8')
    const result = parseFileToThreads(content, fileName)
    allThreads.push(...result.threads)
    allErrors.push(...result.errors)
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(OUTPUT_FILE, `${JSON.stringify(allThreads, null, 2)}\n`, 'utf-8')
  await writeFile(ERROR_FILE, `${JSON.stringify(allErrors, null, 2)}\n`, 'utf-8')

  console.log(`Converted ${txtFiles.length} file(s)`)
  console.log(`Generated: ${path.relative(ROOT, OUTPUT_FILE)}`)
  console.log(`Errors: ${allErrors.length}`)
}

main().catch((error: unknown) => {
  console.error('convert failed:', error)
  process.exitCode = 1
})
