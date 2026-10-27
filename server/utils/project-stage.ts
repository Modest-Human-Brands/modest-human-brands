// The pipeline the dashboard shows, in order. Notion's Status property uses its own names for three of them
export const projectStages = ['Plan', 'Crew', 'Document', 'Pre-Production', 'Production', 'Post-Production', 'Delivered'] as const

const notionStatusByStage: Record<ProjectStatus, string> = {
  Plan: 'Plan',
  Crew: 'Crew',
  Document: 'Quotation',
  'Pre-Production': 'Pre-Production',
  Production: 'Shoot',
  'Post-Production': 'Edit',
  Delivered: 'Delivered',
}

export function toNotionStatus(stage: ProjectStatus) {
  return notionStatusByStage[stage]
}

export function toProjectStage(notionStatus?: string): ProjectStatus {
  return projectStages.find((stage) => notionStatusByStage[stage] === notionStatus) ?? 'Plan'
}

export function projectProgress(stage: ProjectStatus) {
  return Math.round(((projectStages.indexOf(stage) + 1) / projectStages.length) * 100)
}
