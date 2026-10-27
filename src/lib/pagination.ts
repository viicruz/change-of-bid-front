export type PaginationPageItem = number | "ellipsis"

export function getPaginationPageItems(
  currentPage: number,
  pageCount: number
): PaginationPageItem[] {
  if (pageCount <= 0) {
    return []
  }

  const current = Math.min(Math.max(currentPage, 1), pageCount)

  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  if (current <= 2) {
    return [1, 2, "ellipsis", pageCount]
  }

  if (current >= pageCount - 1) {
    return [1, "ellipsis", pageCount - 1, pageCount]
  }

  return [1, "ellipsis", current, "ellipsis", pageCount]
}
