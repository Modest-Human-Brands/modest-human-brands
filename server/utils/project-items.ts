type ItemProperties = Partial<
  NotionScript['properties'] & NotionStoryboard['properties'] & NotionLook['properties'] & NotionSetup['properties'] & NotionEquipment['properties'] & NotionShoot['properties']
>

const relationIds = (relation?: { id: string }[]) => (relation ?? []).map(({ id }) => notionNormalizeId(id)!)

export function projectItemProjectIds(record: ResourceRecordMap[ProjectItemKind]) {
  return relationIds(record.properties.Project?.relation)
}

export async function mapProjectItem(record: ResourceRecordMap[ProjectItemKind]): Promise<ProjectItem> {
  const props = record.properties as unknown as ItemProperties
  const text = (value?: { plain_text: string }[]) => (value ? notionTextStringify(value) : '') || undefined

  const userStorage = useStorage<Resource<'user'>>('data:resource:user')
  const collaboratorIds = relationIds([...(props.Collaborators?.relation ?? []), ...(props.Assigned?.relation ?? [])])
  const collaborators = (
    await Promise.all(
      collaboratorIds.map(async (id) => {
        const user = (await userStorage.getItem(id))?.record
        if (!user) return undefined
        return {
          id: user.id,
          name: notionTextStringify(user.properties.Name.title),
          avatar: user.cover?.type === 'external' ? user.cover.external.url : undefined,
        }
      })
    )
  ).filter((c): c is NonNullable<typeof c> => !!c)

  return {
    id: record.id,
    index: props.Index?.number ?? 0,
    title: notionTextStringify(props.Name?.title ?? []) || 'Untitled',
    status: props.Status?.select?.name,
    shootIds: relationIds(props.Shoot?.relation),
    imageId: text(props['Image ID']?.rich_text),
    duration: text(props.Duration?.rich_text),
    tags: props.Tags?.multi_select?.map((tag) => tag.name) ?? [],
    // MDoc keys documents by the dashed Notion id, so these stay un-normalized
    documentId: props.Document?.relation?.[0]?.id,
    scriptId: props.Script?.relation?.[0]?.id,
    kind: props.Kind?.select?.name,
    specs: text(props.Specs?.rich_text),
    location: text(props.Location?.rich_text),
    date: props.Date?.date?.start,
    equipmentIds: relationIds(props.Equipment?.relation),
    collaborators,
  }
}
