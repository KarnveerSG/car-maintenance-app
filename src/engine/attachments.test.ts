import { describe, expect, it } from 'vitest'
import {
  formatFileSize,
  isAllowedMimeType,
  isImageMime,
  validateAttachmentFile,
} from './attachments'

describe('attachments', () => {
  it('validates allowed mime types', () => {
    expect(isAllowedMimeType('image/jpeg')).toBe(true)
    expect(isAllowedMimeType('application/pdf')).toBe(true)
    expect(isAllowedMimeType('text/plain')).toBe(false)
  })

  it('detects image mime types', () => {
    expect(isImageMime('image/png')).toBe(true)
    expect(isImageMime('application/pdf')).toBe(false)
  })

  it('formats file sizes', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('rejects files over the size limit', () => {
    const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })
    expect(validateAttachmentFile(file, 0)).toMatch(/under/)
  })

  it('rejects unsupported file types', () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    expect(validateAttachmentFile(file, 0)).toMatch(/allowed/)
  })

  it('rejects when max attachments reached', () => {
    const file = new File(['x'], 'r.pdf', { type: 'application/pdf' })
    expect(validateAttachmentFile(file, 5)).toMatch(/Maximum/)
  })
})
