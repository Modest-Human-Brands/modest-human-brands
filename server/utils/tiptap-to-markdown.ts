// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function tipTapToMarkdown(node: any, indent = ''): string {
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
