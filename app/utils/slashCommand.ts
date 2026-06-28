import { Extension } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core' // <-- 1. Fixed Range collision
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import tippy, { type Instance } from 'tippy.js'
import CommandsList from '~/components/AppEditorCommandsList.vue'
import type { CommandItem } from '~/components/AppEditorCommandsList.vue'

const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  // 2. Explicitly typing this array passes context down to the destructured ({ editor, range }) args
  const items: CommandItem[] = [
    {
      title: 'Text',
      description: 'Just start writing with plain text.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run()
      },
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: 'To-do List',
      description: 'Track tasks with a checklist.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: 'Callout Box',
      description: 'Make text stand out with an emoji callout.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('callout').run()
      },
    },
    {
      title: 'Table',
      description: 'Insert a simple 3x3 table.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create an ordered numbered list.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
  ]

  return items.filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
}

const renderSuggestion = () => {
  let component: VueRenderer
  let popup: Instance[] | undefined

  return {
    onStart: (props: SuggestionProps<CommandItem>) => {
      component = new VueRenderer(CommandsList, {
        props,
        editor: props.editor,
      })

      if (!props.clientRect) {
        return
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect as () => DOMRect,
        appendTo: () => document.body,
        content: component.element as Element, // <-- 3. Fixed Tippy Nullable error
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })
    },

    onUpdate: (props: SuggestionProps<CommandItem>) => {
      component?.updateProps(props)
      if (!props.clientRect) return

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect as () => DOMRect,
      })
    },

    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (props.event.key === 'Escape') {
        popup?.[0]?.hide()
        return true
      }
      return component?.ref?.onKeyDown(props)
    },

    onExit: () => {
      popup?.[0]?.destroy()
      component?.destroy()
    },
  }
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: getSuggestionItems,
        render: renderSuggestion,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: CommandItem }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
