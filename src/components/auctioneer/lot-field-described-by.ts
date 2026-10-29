//* Ids for aria-describedby: the hint, then the error when there is one
export function lotFieldDescribedBy(props: {
  id: string
  hint?: boolean
  error?: unknown
}) {
  const ids = [
    props.hint ? `${props.id}-hint` : null,
    props.error ? `${props.id}-error` : null,
  ].filter((id) => id !== null)

  return ids.length > 0 ? ids.join(" ") : undefined
}
