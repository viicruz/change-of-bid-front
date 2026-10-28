//* Components imports
import { YugiohCard } from "@/src/components/cards/yugioh-card"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

type LotItem = ShowLot["lot"]["items"][number]

export function LotItemCard(props: { item: LotItem }) {
  const item = props.item

  return (
    <li className="min-w-0">
      <YugiohCard
        id={`lot-item-${item.id}`}
        nameId={`lot-item-name-${item.id}`}
        quantityId={`lot-item-quantity-${item.id}`}
        name={item.cardName}
        imageUrl={item.imagePath}
        size="md"
        amount={item.quantity}
      />
    </li>
  )
}
