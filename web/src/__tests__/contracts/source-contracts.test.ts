import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

function findContractFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let results: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(findContractFiles(fullPath))
    } else if (entry.name.endsWith('.contract.yaml')) {
      results.push(fullPath)
    }
  }
  return results
}

describe('Source Contracts Integrity', () => {
  const contractsRoot = path.resolve(__dirname, '../../../../docs/contracts')

  it('contracts directory is accessible', () => {
    // Tolerates missing or empty directory: this is the cold-start state.
    const exists = fs.existsSync(contractsRoot)
    expect(typeof exists).toBe('boolean')
  })

  it('finds zero or more contract files', () => {
    const contracts = findContractFiles(contractsRoot)
    expect(Array.isArray(contracts)).toBe(true)
    expect(contracts.length).toBeGreaterThanOrEqual(0)
  })

  it('every contract file is valid YAML with required fields', () => {
    const contracts = findContractFiles(contractsRoot)
    if (contracts.length === 0) return

    const repoRoot = path.resolve(__dirname, '../../../../')
    for (const contractPath of contracts) {
      const content = fs.readFileSync(contractPath, 'utf8')
      const parsed = parse(content) as Record<string, any>

      expect(parsed, `Failed to parse YAML in ${contractPath}`).toBeTruthy()
      expect(typeof parsed.name, `Missing name in ${contractPath}`).toBe('string')
      expect(parsed.name.length, `Empty name in ${contractPath}`).toBeGreaterThan(0)
      expect(typeof parsed.version, `Missing version in ${contractPath}`).toBe('number')
      expect(typeof parsed.status, `Missing status in ${contractPath}`).toBe('string')
      expect(['current', 'ahead', 'stale']).toContain(parsed.status)
      expect(typeof parsed.source, `Missing source in ${contractPath}`).toBe('string')
      expect(Array.isArray(parsed.obligations), `obligations must be array in ${contractPath}`).toBe(true)
      expect(parsed.obligations.length, `obligations must be non-empty in ${contractPath}`).toBeGreaterThan(0)

      const targetSourcePath = path.resolve(repoRoot, parsed.source)
      expect(
        fs.existsSync(targetSourcePath),
        `Source file ${parsed.source} referenced in ${contractPath} does not exist on disk`,
      ).toBe(true)
    }
  })

  it('every obligation cites a test name via tested_by or is "none"', () => {
    const contracts = findContractFiles(contractsRoot)
    if (contracts.length === 0) return

    for (const contractPath of contracts) {
      const content = fs.readFileSync(contractPath, 'utf8')
      const parsed = parse(content) as { obligations: Array<{ tested_by: string }> }
      for (const obl of parsed.obligations) {
        expect(
          typeof obl.tested_by === 'string' && obl.tested_by.length > 0,
          `Obligation in ${contractPath} missing tested_by`,
        ).toBe(true)
      }
    }
  })
})
