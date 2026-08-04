const FORBIDDEN_TAGS = ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'LINK', 'META', 'STYLE', 'TEMPLATE', 'SVG', 'MATH']

export function sanitizeHtml(html) {
  if (!html) return ''
  if (typeof document === 'undefined') return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName.toUpperCase()
    if (FORBIDDEN_TAGS.includes(tag)) {
      el.remove()
      return
    }
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        return
      }
      if ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:')) {
        el.removeAttribute(attr.name)
      }
    })
  })
  return doc.body ? doc.body.innerHTML : ''
}
