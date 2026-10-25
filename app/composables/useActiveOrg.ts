/** The workspace the user is acting in, with the slug that public links and the microservices use. */
export function useActiveOrg() {
  const { user } = useUserSession()
  const cookieOrgId = useCookie<string | undefined>('active-org-id')

  const orgId = computed(() => user.value?.organizations?.find((org) => org.orgId === cookieOrgId.value)?.orgId ?? user.value?.organizations?.[0]?.orgId)
  const { data: organization } = useFetch(() => `/api/organization/${orgId.value}`, { immediate: !!orgId.value })

  return { orgId, orgSlug: computed(() => organization.value?.slug ?? '') }
}
