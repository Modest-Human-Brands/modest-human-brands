// A look keeps its appearance list in tags, so its chips and tag line come from keywords instead
export function itemLabels(item: ProjectItem, kind: string): string[] {
  return kind === 'look' ? item.keywords : item.tags
}
