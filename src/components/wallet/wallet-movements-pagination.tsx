"use client"

//* Libraries imports
import { useTranslations } from "next-intl";
import type { MouseEvent } from "react";
import { parseAsInteger, useQueryState } from "nuqs";

//* Components imports
import Pagination from "@/src/components/ui/pagination";

//* Lib imports
import { getPaginationPageItems } from "@/src/lib/pagination";

type WalletMovementsPaginationProps = {
    total: number
    limit: number
}

export function WalletMovementsPagination(props: WalletMovementsPaginationProps) {
    const t = useTranslations("pages./wallet");
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
    const items = getPaginationPageItems(page, Math.ceil(props.total / props.limit));

    function onPrevious() {
        setPage(page - 1)
    }

    function onNext() {
        setPage(page + 1)
    }

    function onPageClick(event: MouseEvent<HTMLButtonElement>) {
        const nextPage = Number(event.currentTarget.dataset.page)

        if (!Number.isInteger(nextPage)) {
            return
        }

        setPage(nextPage)
    }

    return (
        <Pagination.Root
            id="wallet-movements-pagination"
            aria-label={t("movements.pagination")}
        >
            <Pagination.Content className="flex-wrap justify-center">
                <Pagination.Item>
                    <Pagination.Previous
                        id="wallet-movements-previous"
                        type="button"
                        size="icon"
                        text={t("movements.previous")}
                        aria-label={t("movements.previous")}
                        disabled={page <= 1}
                        className="px-0! **:data-[slot=pagination-label]:sr-only"
                        onClick={onPrevious}
                    />
                </Pagination.Item>
                {items.map((item, index) => {
                    if (item === "ellipsis") {
                        return (
                            <Pagination.Item key={`wallet-movements-ellipsis-${index}`}>
                                <Pagination.Ellipsis label={t("movements.morePages")} />
                            </Pagination.Item>
                        )
                    }

                    return (
                        <Pagination.Item key={item}>
                            <Pagination.Link
                                id={`wallet-movements-page-${item}`}
                                type="button"
                                isActive={item === page}
                                data-page={item}
                                aria-label={
                                    item === page
                                        ? t("movements.currentPage", { page: String(item) })
                                        : t("movements.goToPage", { page: String(item) })
                                }
                                onClick={onPageClick}
                            >
                                {item}
                            </Pagination.Link>
                        </Pagination.Item>
                    )
                })}
                <Pagination.Item>
                    <Pagination.Next
                        id="wallet-movements-next"
                        type="button"
                        size="icon"
                        text={t("movements.next")}
                        aria-label={t("movements.next")}
                        disabled={page >= Math.ceil(props.total / props.limit)}
                        className="px-0! **:data-[slot=pagination-label]:sr-only"
                        onClick={onNext}
                    />
                </Pagination.Item>
            </Pagination.Content>
        </Pagination.Root>
    )
}