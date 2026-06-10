export function sanitizeRichText(html?: string): string {
  if (!html) return ''
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const allowedTags = new Set([
    'P',
    'BR',
    'DIV',
    'SPAN',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'S',
    'UL',
    'OL',
    'LI',
    'BLOCKQUOTE',
    'A',
    'IMG',
  ])

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      if (!allowedTags.has(element.tagName)) {
        const fragment = document.createDocumentFragment()
        while (element.firstChild) {
          fragment.appendChild(element.firstChild)
        }
        element.replaceWith(fragment)
        return
      }

      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase()
        const value = attr.value
        const isEvent = name.startsWith('on')
        const isUnsafeHref = (name === 'href' || name === 'src') && /^javascript:/i.test(value)
        const isAllowedHref = element.tagName === 'A' && ['href', 'target', 'rel'].includes(name)
        const isAllowedImg = element.tagName === 'IMG' && ['src', 'alt', 'title'].includes(name)
        const isAllowedStyle = name === 'style' && element.tagName === 'IMG'

        if (isEvent || isUnsafeHref || (!isAllowedHref && !isAllowedImg && !isAllowedStyle)) {
          element.removeAttribute(attr.name)
        }
      })

      if (element.tagName === 'A') {
        const href = element.getAttribute('href')
        if (href) {
          element.setAttribute('target', '_blank')
          element.setAttribute('rel', 'noopener noreferrer')
        }
      }

      if (element.tagName === 'IMG') {
        element.style.maxWidth = '100%'
        element.style.height = 'auto'
        element.style.borderRadius = '8px'
        element.style.display = 'block'
        element.style.margin = '8px 0'
      }
    }

    Array.from(node.childNodes).forEach(walk)
  }

  Array.from(doc.body.childNodes).forEach(walk)
  return doc.body.innerHTML
}

export function richTextToPlainText(html?: string): string {
  if (!html) return ''
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}
