import type { AttachmentMimeType, ServiceAttachment } from '../types'
import { createId } from './format'

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024
export const MAX_ATTACHMENTS_PER_RECORD = 5

export const ALLOWED_ATTACHMENT_TYPES: AttachmentMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

export const isAllowedMimeType = (mime: string): mime is AttachmentMimeType =>
  (ALLOWED_ATTACHMENT_TYPES as string[]).includes(mime)

export const isImageMime = (mime: AttachmentMimeType): boolean => mime.startsWith('image/')

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const validateAttachmentFile = (file: File, currentCount: number): string | null => {
  if (currentCount >= MAX_ATTACHMENTS_PER_RECORD) {
    return `Maximum ${MAX_ATTACHMENTS_PER_RECORD} attachments per record`
  }
  if (!isAllowedMimeType(file.type)) {
    return 'Only JPEG, PNG, WebP, GIF images and PDF files are allowed'
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `File must be under ${formatFileSize(MAX_ATTACHMENT_BYTES)}`
  }
  return null
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

export const readFileAsAttachment = async (file: File): Promise<ServiceAttachment> => {
  const error = validateAttachmentFile(file, 0)
  if (error) throw new Error(error)
  if (!isAllowedMimeType(file.type)) throw new Error('Unsupported file type')

  const dataUrl = await readFileAsDataUrl(file)
  return {
    id: createId(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    dataUrl,
  }
}
