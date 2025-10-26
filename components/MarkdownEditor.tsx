"use client"

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Enter text with markdown formatting...',
  height = 300
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatButtons = [
    {
      label: 'Bold',
      icon: 'B',
      action: () => insertMarkdown('**', '**'),
      className: 'font-bold'
    },
    {
      label: 'Italic',
      icon: 'I',
      action: () => insertMarkdown('*', '*'),
      className: 'italic'
    },
    {
      label: 'Heading',
      icon: 'H',
      action: () => insertMarkdown('## '),
      className: 'font-bold'
    },
    {
      label: 'List',
      icon: '•',
      action: () => insertMarkdown('- '),
      className: ''
    },
    {
      label: 'Link',
      icon: '🔗',
      action: () => insertMarkdown('[', '](url)'),
      className: ''
    },
    {
      label: 'Code',
      icon: '</>',
      action: () => insertMarkdown('`', '`'),
      className: 'font-mono text-xs'
    },
  ]

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        {formatButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={button.action}
            className={`px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 active:bg-gray-200 ${button.className}`}
            title={button.label}
          >
            {button.icon}
          </button>
        ))}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      {showPreview ? (
        <div
          className="p-4 bg-white overflow-auto prose prose-sm max-w-none"
          style={{ minHeight: `${height}px` }}
        >
          <ReactMarkdown>{value || '*No content to preview*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 resize-none focus:outline-none font-mono text-sm"
          style={{ height: `${height}px` }}
        />
      )}
    </div>
  )
}
