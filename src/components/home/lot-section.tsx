"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"

//* Components imports
import { LotCard } from "@/src/components/home/lot-card"
import { LiveDot, SectionHeading, Tag } from "@/src/components/ui/brand"
import Pagination from "@/src/components/ui/pagination"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import { useIndexLots } from "@/src/hooks/lots/queries/use-index-lots"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

//* Lib imports
import {
  getPaginationPageItems,
  type PaginationPageItem,
} from "@/src/lib/pagination"
import { cn } from "@/src/lib/utils"

const loadingSkeletonCount = 4
const lotPageSize = 8
//* useLayoutEffect warns during server render, where effects do not run
const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

//* Anchors used by the navbar and the hero CTA
export const lotSectionAnchors = {
  LIVE: "live",
  SCHEDULED: "scheduled",
  ENDED: "ended",
} as const satisfies Record<PublicLotStatus, string>

const sectionStyles = {
  LIVE: {
    section: "bg-bg-alt",
    tag: "red",
    title: undefined,
    description: undefined,
    message: "text-muted-foreground",
  },
  //* Yellow in both themes, so its text stays dark
  SCHEDULED: {
    section:
      "border-y-4 border-black bg-brand-yellow bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.05)_0_2px,transparent_2px_22px)] text-brand-ink",
    tag: "dark",
    title: "text-brand-ink",
    description: "text-[#2a2230]",
    message: "text-brand-ink",
  },
  ENDED: {
    section: "bg-background",
    tag: "inverse",
    title: undefined,
    description: undefined,
    message: "text-muted-foreground",
  },
} as const

const gridClassName =
  "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-8 gap-y-9"

export function LotSection(props: {
  status: PublicLotStatus
  query: string
  children?: ReactNode
}) {
  const t = useTranslations("pages./")
  const lotsQuery = useIndexLots({
    q: props.query,
    status: props.status,
  })
  const pageKey = `${props.status}\0${props.query}`
  const [pageState, setPageState] = useState({
    pageKey,
    page: 1,
  })
  const page = pageState.pageKey === pageKey ? pageState.page : 1
  const lots = lotsQuery.data?.lots ?? []
  const pageCount = Math.max(1, Math.ceil(lots.length / lotPageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * lotPageSize
  const pageLots = lots.slice(pageStart, pageStart + lotPageSize)
  const showPagination = lots.length > lotPageSize
  const styles = sectionStyles[props.status]
  const headingId = `lot-section-${props.status}`
  const sectionRef = useRef<HTMLElement>(null)
  const pageScrollRef = useRef<number | null>(null)

  useClientLayoutEffect(() => {
    if (pageScrollRef.current !== currentPage) {
      return
    }

    pageScrollRef.current = null
    sectionRef.current?.scrollIntoView({ block: "start" })
  }, [currentPage])

  function onPageChange(nextPage: number) {
    if (nextPage === currentPage || nextPage < 1 || nextPage > pageCount) {
      return
    }

    pageScrollRef.current = nextPage
    setPageState({
      pageKey,
      page: nextPage,
    })
  }

  return (
    <section
      ref={sectionRef}
      id={lotSectionAnchors[props.status]}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-20 py-[clamp(72px,8vw,112px)] [overflow-anchor:none]",
        styles.section
      )}
    >
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <SectionHeading
          id={headingId}
          tag={
            <Tag tone={styles.tag} className="text-sm">
              {props.status === "LIVE" ? <LiveDot size={9} /> : null}
              {t(`sections.${props.status}.tag`)}
            </Tag>
          }
          title={
            <span className={styles.title}>
              {t(`sections.${props.status}.title`)}
            </span>
          }
          description={t(`sections.${props.status}.description`)}
          descriptionClassName={styles.description}
        >
          {props.children}
        </SectionHeading>
        {lotsQuery.isError ? (
          <p
            id={`lot-section-${props.status}-error`}
            className={cn("text-lg font-semibold", styles.message)}
          >
            {t("error")}
          </p>
        ) : lotsQuery.isPending ? (
          <>
            <p className="sr-only">{t("loading")}</p>
            <ul
              aria-labelledby={headingId}
              aria-busy="true"
              className={gridClassName}
            >
              {Array.from({ length: loadingSkeletonCount }, (_, index) => (
                <li key={`${props.status}-skeleton-${index}`}>
                  <Skeleton className="aspect-3/5 w-full rounded-none border-4 border-black/20" />
                </li>
              ))}
            </ul>
          </>
        ) : lots.length === 0 ? (
          <p
            id={`lot-section-${props.status}-empty`}
            className={cn("text-lg font-semibold", styles.message)}
          >
            {t("empty")}
          </p>
        ) : (
          <>
            <ul
              id={`lot-section-${props.status}-list`}
              aria-labelledby={headingId}
              className={gridClassName}
            >
              {pageLots.map((lot) => (
                <li key={lot.id}>
                  <LotCard lot={lot} />
                </li>
              ))}
            </ul>
            {showPagination ? (
              <LotSectionPagination
                status={props.status}
                sectionTitle={t(`sections.${props.status}.title`)}
                page={currentPage}
                pageCount={pageCount}
                onPageChange={onPageChange}
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

type LotSectionPaginationProps = {
  status: PublicLotStatus
  sectionTitle: string
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function paginationEntryKey(
  item: PaginationPageItem,
  previousItem: PaginationPageItem | undefined
) {
  if (item !== "ellipsis") {
    return String(item)
  }

  if (previousItem === 1) {
    return "ellipsis-after-first"
  }

  return "ellipsis-before-last"
}

function getPaginationEntries(page: number, pageCount: number) {
  const items = getPaginationPageItems(page, pageCount)
  let previousItem: PaginationPageItem | undefined

  return items.map((item) => {
    const key = paginationEntryKey(item, previousItem)

    previousItem = item

    return {
      item,
      key,
    }
  })
}

function LotSectionPagination(props: LotSectionPaginationProps) {
  const t = useTranslations("pages./")
  const entries = getPaginationEntries(props.page, props.pageCount)
  const idPrefix = `lot-section-${props.status}`

  function onPrevious() {
    props.onPageChange(props.page - 1)
  }

  function onNext() {
    props.onPageChange(props.page + 1)
  }

  function onPageClick(event: MouseEvent<HTMLButtonElement>) {
    const nextPage = Number(event.currentTarget.dataset.page)

    if (!Number.isInteger(nextPage)) {
      return
    }

    props.onPageChange(nextPage)
  }

  return (
    <Pagination.Root
      id={`${idPrefix}-pagination`}
      aria-label={t("pagination", { section: props.sectionTitle })}
      className="pt-10"
    >
      <Pagination.Content className="flex-wrap justify-center">
        <Pagination.Item>
          <Pagination.Previous
            id={`${idPrefix}-previous`}
            type="button"
            size="icon"
            text={t("previous")}
            aria-label={t("previous")}
            disabled={props.page <= 1}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onPrevious}
          />
        </Pagination.Item>
        {entries.map((entry) => {
          if (entry.item === "ellipsis") {
            return (
              <Pagination.Item key={entry.key}>
                <Pagination.Ellipsis label={t("morePages")} />
              </Pagination.Item>
            )
          }

          return (
            <Pagination.Item key={entry.key}>
              <Pagination.Link
                id={`${idPrefix}-page-${entry.item}`}
                type="button"
                isActive={entry.item === props.page}
                data-page={entry.item}
                aria-label={
                  entry.item === props.page
                    ? t("currentPage", { page: String(entry.item) })
                    : t("goToPage", { page: String(entry.item) })
                }
                onClick={onPageClick}
              >
                {entry.item}
              </Pagination.Link>
            </Pagination.Item>
          )
        })}
        <Pagination.Item>
          <Pagination.Next
            id={`${idPrefix}-next`}
            type="button"
            size="icon"
            text={t("next")}
            aria-label={t("next")}
            disabled={props.page >= props.pageCount}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onNext}
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
