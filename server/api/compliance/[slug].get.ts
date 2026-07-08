import { z } from 'zod'
import type { NotionCompliance } from '~~/shared/types'

const paramSchema = z.object({ slug: z.string().min(1) })

export interface ComplianceDocMeta {
  id: string
  slug: string
  title: string
  updatedAt?: string
}

/**
 * Recursively converts a TipTap / ProseMirror JSON node into clean Markdown.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tipTapToMarkdown(node: any, indent = ''): string {
  if (!node) return ''

  if (typeof node === 'string') return node

  if (node.type === 'text') {
    let text = node.text || ''
    if (node.marks && Array.isArray(node.marks)) {
      for (const mark of node.marks) {
        if (mark.type === 'bold' || mark.type === 'strong') text = `**${text}**`
        else if (mark.type === 'italic' || mark.type === 'em') text = `*${text}*`
        else if (mark.type === 'code') text = `\`${text}\``
        else if (mark.type === 'strike') text = `~~${text}~~`
        else if (mark.type === 'link' && mark.attrs?.href) text = `[${text}](${mark.attrs.href})`
      }
    }
    return text
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderChildren = (children: any[], childIndent = indent, separator = '') => {
    if (!children || !Array.isArray(children)) return ''
    return children.map((child) => tipTapToMarkdown(child, childIndent)).join(separator)
  }

  switch (node.type) {
    case 'doc':
      return renderChildren(node.content, '', '\n\n').trim()

    case 'heading': {
      const level = Math.min(Math.max(node.attrs?.level || 1, 1), 6)
      return `${'#'.repeat(level)} ${renderChildren(node.content)}`
    }

    case 'paragraph':
      return renderChildren(node.content, indent, '')

    case 'bulletList':
      return renderChildren(node.content, indent, '\n')

    case 'orderedList':
      return (
        (node.content || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((child: any, idx: number) => {
            const itemText = tipTapToMarkdown(child, indent + '   ')
            return `${indent}${idx + 1}. ${itemText.trimStart()}`
          })
          .join('\n')
      )

    case 'listItem': {
      const contentMarkdown = renderChildren(node.content, indent + '  ', '\n\n')

      const lines = contentMarkdown.split('\n')
      const firstLine = `${indent}- ${lines[0] || ''}`
      const remainingLines = lines.slice(1).map((line) => (line.trim() ? `${indent}  ${line}` : ''))
      return [firstLine, ...remainingLines].join('\n').trimEnd()
    }

    case 'taskList':
      return renderChildren(node.content, indent, '\n')

    case 'taskItem': {
      const checkbox = node.attrs?.checked ? '[x]' : '[ ]'
      return `${indent}- ${checkbox} ${renderChildren(node.content, indent + '    ', '\n\n').trimStart()}`
    }

    case 'blockquote':
      return renderChildren(node.content, indent, '\n\n')
        .split('\n')
        .map((line) => `${indent}> ${line}`)
        .join('\n')

    case 'hardBreak':
      return '\n' + indent

    default:
      return renderChildren(node.content, indent, '\n\n')
  }
}

export default defineEventHandler(async (event) => {
  try {
    // await requireUserSession(event)

    const { slug } = await getValidatedRouterParams(event, paramSchema.parse)

    const metaStorage = useStorage<Resource<'compliance'>>('data:resource:compliance')
    const docStorage = useStorage<Record<string, unknown>>('data:resource:compliance:content')

    const keys = await metaStorage.getKeys()
    let targetRecord: NotionCompliance | null = null

    for (const key of keys) {
      const item = await metaStorage.getItem(key)
      if (item?.record?.properties?.Slug?.formula.string === slug) {
        targetRecord = item.record
        break
      }
    }

    if (!targetRecord) {
      throw createError({ statusCode: 404, statusMessage: `Compliance policy '${slug}' does not exist.` })
    }

    const docMeta: ComplianceDocMeta = {
      id: targetRecord.id,
      slug,
      title: targetRecord.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      updatedAt: targetRecord.last_edited_time,
    }

    let content = await docStorage.getItem(slug)

    if (!content) {
      const blocks = await notion.blocks.children.list({
        block_id: targetRecord.id,
      })

      const rawJsonString = blocks.results.map((b) => ('paragraph' in b ? b.paragraph?.rich_text?.[0]?.plain_text || '' : '')).join('')

      if (rawJsonString) {
        content = JSON.parse(rawJsonString)
        await docStorage.setItem(slug, content as Record<string, unknown>)
      }
    }

    const markdown = content ? tipTapToMarkdown(content) : null

    return {
      ...docMeta,
      content: content ?? null,
      markdown,
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API compliance/[slug] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
