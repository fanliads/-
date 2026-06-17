import { post, get } from '@/utils/request'

export interface SubmitRequirementDTO {
  title: string
  description?: string
  source: string
  proposer?: string
  projectName?: string
  priority?: string
  businessLine?: string
  productDefinition?: string
  productManager?: string
  projectManager?: string
}

export interface ExecuteActionDTO {
  reqType: string
  reqId: number
  toStatus: string
  remark?: string
}

export interface ActionVO {
  actionName: string
  toStatus: string
  needApproval: boolean
}

export interface FlowConfigNode {
  status: string
  statusName: string
  actions: FlowConfigAction[]
}

export interface FlowConfigAction {
  actionName: string
  toStatus: string
  roles: string[]
  needApproval: boolean
}

/** 提交新需求 */
export function submitRequirement(data: SubmitRequirementDTO) {
  return post<{ id: number; reqNo: string }>('/workflow/submit', data)
}

/** 获取可执行操作列表 */
export function getAvailableActions(reqType: string, reqId: number) {
  return get<ActionVO[]>(`/workflow/actions/${reqType}/${reqId}`)
}

/** 执行审批/流转操作 */
export function executeAction(data: ExecuteActionDTO) {
  return post('/workflow/execute', data)
}

/** 获取状态流转配置 */
export function getFlowConfig(reqType: string) {
  return get<FlowConfigNode[]>(`/workflow/flow-config/${reqType}`)
}
