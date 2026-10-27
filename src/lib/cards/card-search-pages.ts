//* Lib imports
import {
  getPaginationPageItems,
  type PaginationPageItem,
} from "@/src/lib/pagination"

export const cardSearchPageSize = 16

export type CardSearchPageItem = PaginationPageItem

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
  return getPaginationPageItems(currentPage, pageCount)
}
