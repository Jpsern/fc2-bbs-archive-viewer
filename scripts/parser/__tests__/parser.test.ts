import { describe, expect, it } from 'vitest'
import { parseFileToThreads } from '../parser'

const parentPost = `POSTED BY: Alice
SUBJECT: First topic
EMAIL: a@example.com
SITE: https://example.com
DATE: 2024-01-01T00:00:00+09:00
USER AGENT: UA
IP: 127.0.0.1
ICON: star
COLOR: blue
AUTHORIZED: true

Hello parent`

const replyPost = `-----
REPLY:
POSTED BY: Bob
SUBJECT: Re: First topic
EMAIL: b@example.com
SITE: https://example.com/b
DATE: 2024-01-01T01:00:00+09:00
USER AGENT: UA2
IP: 127.0.0.2
ICON: heart
COLOR: red
AUTHORIZED: false

Hello reply`

describe('parseFileToThreads', () => {
  it('builds one thread from parent + reply', () => {
    const text = `${parentPost}\n${replyPost}`
    const result = parseFileToThreads(text, 'sample.txt')

    expect(result.errors).toHaveLength(0)
    expect(result.threads).toHaveLength(1)
    expect(result.threads[0].replyCount).toBe(1)
    expect(result.threads[0].posts).toHaveLength(2)
    expect(result.threads[0].posts[0].type).toBe('parent')
    expect(result.threads[0].posts[1].type).toBe('reply')
  })

  it('records errors for missing required fields and invalid date', () => {
    const broken = `POSTED BY: Alice\nSUBJECT: Broken\n\nBody only`
    const result = parseFileToThreads(broken, 'broken.txt')

    expect(result.errors.some((error) => error.code === 'MISSING_REQUIRED_FIELD')).toBe(true)
    expect(result.errors.some((error) => error.code === 'INVALID_DATE')).toBe(true)
  })

  it('records thread structure error for orphan reply', () => {
    const orphan = `REPLY:
POSTED BY: Bob
SUBJECT: orphan
EMAIL: b@example.com
SITE: https://example.com
DATE: 2024-01-01T01:00:00+09:00
USER AGENT: UA2
IP: 127.0.0.2
ICON: heart
COLOR: red
AUTHORIZED: false

Hello reply`

    const result = parseFileToThreads(orphan, 'orphan.txt')
    expect(result.errors.some((error) => error.code === 'THREAD_STRUCTURE')).toBe(true)
    expect(result.threads).toHaveLength(1)
  })
})
