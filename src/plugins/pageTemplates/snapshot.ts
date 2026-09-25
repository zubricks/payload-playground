const keysToRemove = new Set(['id'])

const cloneTemplateValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(cloneTemplateValue)
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>((result, [key, childValue]) => {
      if (!keysToRemove.has(key)) {
        result[key] = cloneTemplateValue(childValue)
      }

      return result
    }, {})
  }

  return value
}

export const createPageTemplateSnapshot = (
  page: unknown,
  templateFields: string[] = ['hero', 'layout', 'meta'],
): Record<string, unknown> => {
  const pageData = page as Record<string, unknown>

  return cloneTemplateValue(
    Object.fromEntries(templateFields.map((fieldName) => [fieldName, pageData[fieldName]])),
  ) as Record<string, unknown>
}
