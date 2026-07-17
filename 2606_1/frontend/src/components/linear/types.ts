export interface LnOption {
  label: string
  value: string
  description?: string
  color?: string
  icon?: string
  disabled?: boolean
}

export interface LnFilterRule {
  id: string
  field: string
  operator: string
  value: string
}

export interface LnToastItem {
  id: string | number
  title: string
  description?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface LnTabOption {
  label: string
  value: string
  count?: number
  icon?: string
  disabled?: boolean
}

export interface LnCalendarEvent {
  id: string | number
  title: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
}

export interface LnBreadcrumbItem {
  label: string
  to?: string
  href?: string
}

export interface LnInlineOption {
  label: string
  value: string | number
  description?: string
  color?: string
  tone?: 'neutral' | 'pending' | 'progress' | 'success' | 'danger' | 'muted'
  disabled?: boolean
}
