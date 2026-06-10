import { del, get, post, put } from '@/utils/request'

export interface SprintOption {
  id: number
  name: string
  teamName?: string
  cadenceType?: 'weekly' | 'biweekly'
}

export interface SprintTeamConfig {
  id: number
  teamName: string
  defaultCadenceType: 'weekly' | 'biweekly'
  autoCreateEnabled: number
}

export interface SprintRequirement {
  id: number
  reqNo: string
  title: string
  priority: string
  status: string
  statusName: string
  businessLineName?: string
  assigneeName?: string
  productModule?: string
}

export interface SprintItem {
  id: number
  name: string
  teamName: string
  cadenceType: 'weekly' | 'biweekly'
  startDate: string
  endDate: string
  status: string
  goal?: string
}

export interface SprintDetail extends SprintItem {
  requirements: SprintRequirement[]
}

export interface SprintPayload {
  name: string
  teamName: string
  cadenceType: 'weekly' | 'biweekly'
  startDate: string
  endDate: string
  status?: string
  goal?: string
}

export function listSprints() {
  return get<{ data: SprintItem[] }>('/sprint/list')
}

export function listSprintOptions() {
  return get<{ data: SprintOption[] }>('/sprint/options')
}

export function listSprintTeamConfigs() {
  return get<{ data: SprintTeamConfig[] }>('/sprint/team-configs')
}

export function saveSprintTeamConfig(data: Omit<SprintTeamConfig, 'id'>) {
  return post('/sprint/team-configs', data)
}

export function getSprintDetail(id: number) {
  return get<{ data: SprintDetail }>(`/sprint/${id}`)
}

export function createSprint(data: SprintPayload) {
  return post<{ data: number }>('/sprint', data)
}

export function updateSprint(id: number, data: Partial<SprintPayload>) {
  return put(`/sprint/${id}`, data)
}

export function deleteSprint(id: number) {
  return del(`/sprint/${id}`)
}

export function bindSprintRequirement(sprintId: number, requirementId: number) {
  return put(`/sprint/${sprintId}/requirements/${requirementId}`)
}

export function removeSprintRequirement(sprintId: number, requirementId: number) {
  return del(`/sprint/${sprintId}/requirements/${requirementId}`)
}
