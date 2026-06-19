import { useRef } from 'react'
import type { ServiceAttachment } from '../../types'
import {
  MAX_ATTACHMENTS_PER_RECORD,
  formatFileSize,
  isImageMime,
  readFileAsAttachment,
  validateAttachmentFile,
} from '../../engine/attachments'

interface AttachmentInputProps {
  attachments: ServiceAttachment[]
  onChange: (attachments: ServiceAttachment[]) => void
}

export function AttachmentInput({ attachments, onChange }: AttachmentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const next = [...attachments]
    for (const file of Array.from(files)) {
      const error = validateAttachmentFile(file, next.length)
      if (error) {
        alert(error)
        continue
      }
      try {
        const attachment = await readFileAsAttachment(file)
        next.push(attachment)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to add attachment')
      }
    }
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="label">Receipts & photos (optional)</label>
      <p className="mb-2 text-xs text-garage-muted">
        JPEG, PNG, WebP, GIF, or PDF · max {formatFileSize(2 * 1024 * 1024)} each · up to{' '}
        {MAX_ATTACHMENTS_PER_RECORD} files
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        multiple
        className="block w-full text-sm text-garage-muted file:mr-3 file:rounded-lg file:border-0 file:bg-garage-elevated file:px-3 file:py-2 file:text-sm file:font-medium file:text-garage-text hover:file:bg-garage-border"
        onChange={(e) => void handleFiles(e.target.files)}
        disabled={attachments.length >= MAX_ATTACHMENTS_PER_RECORD}
      />
      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-garage-elevated px-3 py-2 text-sm"
            >
              <span className="truncate">{att.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-garage-muted">{formatFileSize(att.size)}</span>
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-xs text-garage-danger"
                  onClick={() => onChange(attachments.filter((a) => a.id !== att.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AttachmentListProps {
  attachments: ServiceAttachment[]
  compact?: boolean
}

export function AttachmentList({ attachments, compact }: AttachmentListProps) {
  if (!attachments.length) return null

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
      {attachments.map((att) => (
        <a
          key={att.id}
          href={att.dataUrl}
          download={att.name}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-lg border border-garage-border bg-garage-elevated transition-colors hover:border-garage-amber/40"
          title={att.name}
        >
          {isImageMime(att.mimeType) ? (
            <img
              src={att.dataUrl}
              alt={att.name}
              className={compact ? 'h-16 w-16 object-cover' : 'h-24 w-24 object-cover'}
            />
          ) : (
            <div
              className={`flex flex-col items-center justify-center text-garage-muted ${compact ? 'h-16 w-16 px-1' : 'h-24 w-24 px-2'}`}
            >
              <span className="text-lg">PDF</span>
              <span className="max-w-full truncate text-[10px]">{att.name}</span>
            </div>
          )}
        </a>
      ))}
    </div>
  )
}
