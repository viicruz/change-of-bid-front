export const cardSearchPageSize = 16

export type CardSearchPageItem = number | "ellipsis"

export function getCardSearchPageCount(totalRows: number, pageSize: number) {
  if (totalRows <= 0 || pageSize <= 0) {
    return 0
  }

  // The API `total_pages` drops a partial last page, so the count is derived from `total_rows`.
  return Math.ceil(totalRows / pageSize)
}

export function getCardSearchPageItems(
  currentPage: number,
  pageCount: number
): CardSearchPageItem[] {
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
