// @vitest-environment node
// web/src/__tests__/tokens/design-tokens.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
// @ts-expect-error - tailwind config is JS without bundled declaration
import tailwindConfig from '../../../tailwind.config.js'

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(...rgb1)
  const l2 = getLuminance(...rgb2)
  const brightest = Math.max(l1, l2)
  const darkest = Math.min(l1, l2)
  return (brightest + 0.05) / (darkest + 0.05)
}

describe('Admin Semantic Design Tokens & WCAG Contrast', () => {
  it('defines required semantic tokens in index.css with exact calibrated values', () => {
    const cssPath = fileURLToPath(new URL('../../index.css', import.meta.url))
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // Exact regex assertions for calibrated HSL values
    expect(cssContent).toMatch(/--primary\s*:\s*32\.13\s+94\.62%\s+43\.73%\s*;/)
    expect(cssContent).toMatch(/--primary-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--destructive\s*:\s*0\s+72\.22%\s+50\.59%\s*;/)
    expect(cssContent).toMatch(/--destructive-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--success\s*:\s*142\.43\s+71\.81%\s+29\.22%\s*;/)
    expect(cssContent).toMatch(/--success-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--warning\s*:\s*37\.69\s+92\.13%\s+50\.20%\s*;/)
    expect(cssContent).toMatch(/--warning-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--info\s*:\s*201\.27\s+96\.34%\s+32\.16%\s*;/)
    expect(cssContent).toMatch(/--info-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--sidebar-background\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--sidebar-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--sidebar-primary\s*:\s*32\.13\s+94\.62%\s+43\.73%\s*;/)
    expect(cssContent).toMatch(/--radius\s*:\s*1rem\s*;/)
  })

  it('guarantees WCAG AA contrast (>= 4.5:1) across all solid semantic pairs', () => {
    const white: [number, number, number] = [255, 255, 255]
    const nearBlack: [number, number, number] = [15, 23, 42] // #0F172A

    const primaryHex: [number, number, number] = [217, 119, 6] // #D97706
    const destructiveHex: [number, number, number] = [220, 38, 38] // #DC2626
    const successHex: [number, number, number] = [21, 128, 61] // #15803D
    const warningHex: [number, number, number] = [245, 158, 11] // #F59E0B
    const infoHex: [number, number, number] = [3, 105, 161] // #0369A1

    expect(getContrast(primaryHex, nearBlack)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(destructiveHex, white)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(successHex, white)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(warningHex, nearBlack)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(infoHex, white)).toBeGreaterThanOrEqual(4.5)
  })

  it('contains valid components.json configuration with new-york style, zinc baseColor, and rtl: true', () => {
    const configPath = fileURLToPath(new URL('../../../components.json', import.meta.url))
    expect(fs.existsSync(configPath)).toBe(true)
    const json = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    expect(json.style).toBe('new-york')
    expect(json.tailwind.baseColor).toBe('zinc')
    expect(json.rtl).toBe(true)
    expect(json.iconLibrary).toBe('lucide')
    expect(json.tailwind.cssVariables).toBe(true)
    expect(json.aliases.ui).toBe('@/components/ui')
  })

  it('asserts Tailwind config resolves semantic colors and shadow-xs', () => {
    const extendColors = tailwindConfig.theme?.extend?.colors as any
    expect(extendColors).toBeDefined()
    expect(extendColors.primary?.DEFAULT).toContain('var(--primary)')
    expect(extendColors.primary?.foreground).toContain('var(--primary-foreground)')
    expect(extendColors.background).toContain('var(--background)')
    expect(extendColors.foreground).toContain('var(--foreground)')
    expect(extendColors.card?.DEFAULT).toContain('var(--card)')
    expect(extendColors.border).toContain('var(--border)')
    expect(extendColors.sidebar?.background).toContain('var(--sidebar-background)')

    const extendShadows = tailwindConfig.theme?.extend?.boxShadow as any
    expect(extendShadows?.xs).toBe('0 1px 3px rgba(0,0,0,0.05)')
  })
})
