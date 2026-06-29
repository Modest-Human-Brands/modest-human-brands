<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent, type Content } from '@tiptap/vue-3'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Placeholder } from '@tiptap/extensions'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'

const props = withDefaults(defineProps<{ modelValue?: Content }>(), { modelValue: '' })

const emit = defineEmits<{ 'update:modelValue': [value: Content] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder: "Press '/' for commands..." }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Callout,
    SlashCommand,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getJSON() as Content)
  },
})

const containerRef = ref<HTMLElement | null>(null)
const handleTop = ref(0)
const isHandleVisible = ref(false)
const isDragging = ref(false)
const activeNodePos = ref<number | null>(null)

const onEditorMouseMove = (event: MouseEvent) => {
  if (!editor.value?.view || !containerRef.value || isDragging.value) return

  const view = editor.value.view
  const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
  if (!pos) return

  const $pos = view.state.doc.resolve(pos.pos)
  if ($pos.depth === 0) return

  const nodePos = $pos.before(1)
  const domNode = view.nodeDOM(nodePos) as HTMLElement
  if (!domNode) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const nodeRect = domNode.getBoundingClientRect()

  handleTop.value = nodeRect.top - containerRect.top
  activeNodePos.value = nodePos
  isHandleVisible.value = true
}

const addBlockBelow = () => {
  if (!editor.value || activeNodePos.value === null) return
  const node = editor.value.state.doc.nodeAt(activeNodePos.value)
  if (!node) return

  const insertPos = activeNodePos.value + node.nodeSize
  editor.value.chain().focus().insertContentAt(insertPos, '/').run()
}

const onDragStart = (event: DragEvent) => {
  if (!event.dataTransfer || !editor.value || activeNodePos.value === null) return

  isDragging.value = true
  const view = editor.value.view

  editor.value.commands.setNodeSelection(activeNodePos.value)

  const slice = view.state.selection.content()
  const { dom, text } = view.serializeForClipboard(slice)

  event.dataTransfer.setData('text/html', dom.innerHTML)
  event.dataTransfer.setData('text/plain', text)
  event.dataTransfer.effectAllowed = 'move'

  view.dragging = { slice, move: true }
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === undefined) return
    const isSame = typeof value === 'string' ? editor.value.getHTML() === value : JSON.stringify(editor.value.getJSON()) === JSON.stringify(value)

    if (!isSame) editor.value.commands.setContent(value)
  }
)
</script>

<template>
  <div ref="containerRef" class="group/editor relative" @mousemove="onEditorMouseMove" @mouseleave="!isDragging ? (isHandleVisible = false) : ''">
    <div v-show="isHandleVisible" class="absolute -left-14 z-10 hidden items-center gap-0.5 transition-all duration-75 ease-out md:flex" :style="{ top: `${handleTop}px` }">
      <button
        type="button"
        class="flex items-center justify-center rounded p-1 text-light-400 transition-colors hover:bg-light-600/40 hover:text-black dark:hover:bg-dark-600 dark:hover:text-white"
        @click="addBlockBelow">
        <NuxtIcon name="local:plus" class="text-base" />
      </button>

      <div
        draggable="true"
        class="flex cursor-grab items-center justify-center rounded p-1 text-light-400 transition-colors hover:bg-light-600/40 hover:text-black active:cursor-grabbing dark:hover:bg-dark-600 dark:hover:text-white"
        @dragstart="onDragStart"
        @dragend="isDragging = false">
        <NuxtIcon name="local:grip" class="text-base" />
      </div>
    </div>

    <editor-content :editor="editor" class="border-0 outline-none ring-0" />
  </div>
</template>

<style>
.tiptap {
  @apply border-0 font-regular text-black outline-none ring-0 dark:text-white;
}

.tiptap :first-child {
  @apply mt-0;
}

.tiptap p.is-editor-empty:first-child::before,
.tiptap p.is-empty::before {
  @apply pointer-events-none float-left h-0 text-light-500 content-[attr(data-placeholder)];
}

.tiptap ul[data-type='taskList'] {
  @apply my-2 list-none p-0;
}

.tiptap ul[data-type='taskList'] li {
  @apply flex items-start gap-2;
}

.tiptap ul[data-type='taskList'] li > label {
  @apply mt-[0.2rem] flex-none select-none;
}

.tiptap ul[data-type='taskList'] li > div {
  @apply flex-auto;
}

.tiptap ul[data-type='taskList'] input[type='checkbox'] {
  @apply cursor-pointer accent-primary-500;
}

.tiptap ul:not([data-type='taskList']) {
  @apply my-4 list-outside list-disc space-y-1 pl-6;
}

.tiptap ol {
  @apply my-4 list-outside list-decimal space-y-1 pl-6;
}

.tiptap strong {
  @apply font-semi-bold;
}

.tiptap p {
  @apply whitespace-pre-wrap text-sm leading-relaxed md:text-base;
}

.tiptap ul li p,
.tiptap ol li p {
  @apply my-[0.25em];
}

.tiptap ul ul,
.tiptap ol ol,
.tiptap ul ol,
.tiptap ol ul {
  @apply my-1 space-y-1 pl-6;
}

.tiptap ul ul {
  @apply list-[circle];
}

.tiptap ul ul ul {
  @apply list-[square];
}

.tiptap ol li::marker {
  @apply font-semi-bold text-light-400 dark:text-light-500;
}

.tiptap h1,
.tiptap h2,
.tiptap h3,
.tiptap h4,
.tiptap h5,
.tiptap h6 {
  @apply mt-6 font-semi-bold leading-[1.1] [text-wrap:pretty];
}

.tiptap h1,
.tiptap h2 {
  @apply mb-4;
}

.tiptap h1 {
  @apply text-xl font-semi-bold md:text-2xl;
}

.tiptap h2 {
  @apply text-lg font-semi-bold md:text-xl;
}

.tiptap h3 {
  @apply text-base font-semi-bold md:text-lg;
}

.tiptap h4,
.tiptap h5,
.tiptap h6 {
  @apply text-sm font-semi-bold md:text-base;
}

.tiptap blockquote {
  @apply my-6 rounded-r border-l-4 border-primary-500 bg-light-600/10 px-4 py-3 italic text-dark-500 dark:bg-dark-600/40 dark:text-light-600;
}

.tiptap div[data-type='callout'] {
  @apply my-6 flex items-start gap-3 rounded-lg border border-light-600 bg-light-600/20 p-4 text-black dark:border-dark-500 dark:bg-dark-600 dark:text-white;
}

.tiptap div[data-type='callout'] .callout-emoji {
  @apply mt-0.5 select-none text-lg leading-none md:text-xl;
}

.tiptap div[data-type='callout'] .callout-content {
  @apply min-w-0 flex-1;
}

.tiptap table {
  @apply my-6 w-full table-fixed border-collapse overflow-hidden rounded border border-light-600 dark:border-dark-500;
}

.tiptap td,
.tiptap th {
  @apply relative min-w-[1em] border border-light-600 p-2.5 align-top text-sm text-black dark:border-dark-500 dark:text-white;
}

.tiptap th {
  @apply bg-light-600/20 text-left font-semi-bold dark:bg-dark-600;
}

.tiptap .selectedCell:after {
  @apply pointer-events-none absolute inset-0 z-10 bg-primary-400/20 content-[''];
}

.tiptap .column-resize-handle {
  @apply pointer-events-none absolute bottom-0 right-[-2px] top-0 z-20 w-1 bg-primary-500;
}

.tiptap code {
  /* font-mono */
  @apply rounded-[0.4rem] bg-primary-400/20 px-[0.4em] py-[0.2em] text-[0.85rem] font-semi-bold text-primary-600 dark:text-primary-400;
}

.tiptap pre {
  /* font-mono */
  @apply my-6 overflow-x-auto rounded-lg border border-dark-600 bg-dark-400 px-5 py-4 text-xs text-white dark:bg-dark-500 md:text-sm;
}

.tiptap pre code {
  /* text-inherit */
  @apply rounded-none bg-transparent p-0 font-regular;
}

.tiptap hr {
  @apply my-8 border-0 border-t border-light-600 dark:border-dark-500;
}

.tippy-box[data-theme~='dark'],
.tippy-box {
  @apply !border-none !bg-transparent;
}
</style>
