import { Node, mergeAttributes } from '@tiptap/core'

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), ['span', { class: 'callout-emoji', contenteditable: 'false' }, '💡'], ['div', { class: 'callout-content' }, 0]]
  },
})
