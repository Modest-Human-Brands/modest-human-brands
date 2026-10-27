export function mapCrewMember({ id, properties: props }: NotionCrew): ProjectCrewMember {
  return {
    id,
    name: notionTextStringify(props.Name?.title ?? []) || 'Unnamed',
    department: props.Department?.select?.name ?? '',
    role: (props.Role?.multi_select ?? []).map(({ name }) => name).join(', '),
    status: props.Status?.status?.name ?? 'Contacted',
    rate: props.Rate?.number ?? 0,
    rateType: props['Rate Type']?.select?.name ?? '',
    totalAgreedRate: props['Total Agreed Rate']?.number ?? 0,
    email: props.Email?.email ?? '',
    phone: props.Phone?.phone_number ?? undefined,
    portfolioLink: props['Portfolio / Reel Link']?.url ?? undefined,
    location: notionTextStringify(props.Location?.rich_text ?? []) || undefined,
    notes: notionTextStringify(props.Notes?.rich_text ?? []) || undefined,
  }
}
