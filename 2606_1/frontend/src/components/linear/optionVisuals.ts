import type { LnOption } from './types'

export type LnOptionVisual = Pick<LnOption, 'color' | 'icon'>

export const priorityVisuals: Record<string, LnOptionVisual> = {
  P0: { color: '#d05757', icon: 'priority' },
  P1: { color: '#d28b36', icon: 'priority' },
  P2: { color: '#5e6ad2', icon: 'priority' },
  P3: { color: '#6f6f78', icon: 'priority' },
}

const businessLineVisuals: Array<[RegExp, LnOptionVisual]> = [
  [/校园/, { color: '#5e6ad2', icon: 'business-campus' }],
  [/市监|监管/, { color: '#2f9e6f', icon: 'business-regulator' }],
  [/团餐|餐饮/, { color: '#d28b36', icon: 'business-catering' }],
  [/技术支撑|硬件/, { color: '#7b61a8', icon: 'business-support' }],
]

const requirementTypeVisuals: Array<[RegExp, LnOptionVisual]> = [
  [/优化|迭代/, { color: '#5e6ad2', icon: 'type-iteration' }],
  [/问题/, { color: '#d28b36', icon: 'type-issue' }],
  [/缺陷|故障/, { color: '#d05757', icon: 'type-defect' }],
  [/规划|功能/, { color: '#2f9e6f', icon: 'type-feature' }],
]

function resolveVisual(label: string, value: string, visuals: Array<[RegExp, LnOptionVisual]>, fallback: LnOptionVisual): LnOptionVisual {
  const token = `${label} ${value}`
  return visuals.find(([pattern]) => pattern.test(token))?.[1] || fallback
}

export function getBusinessLineVisual(label: string, value = ''): LnOptionVisual {
  return resolveVisual(label, value, businessLineVisuals, { color: '#7a8393', icon: 'business' })
}

export function getRequirementTypeVisual(label: string, value = ''): LnOptionVisual {
  return resolveVisual(label, value, requirementTypeVisuals, { color: '#7a8393', icon: 'type' })
}
