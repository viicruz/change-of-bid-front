//* Libraries imports
import { getTranslations } from "next-intl/server"

//* Components imports
import { Button } from "@/src/components/ui/button"

export default async function Page() {
  const t = await getTranslations("pages./")

  return (
    <div className="flex flex-1 p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("title")}</h1>
          <p>{t("description")}</p>
          <p>{t("buttonAdded")}</p>
          <Button id="home-ready-button" type="button" className="mt-2">
            {t("button")}
          </Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {t.rich("darkModeHint", {
            kbd: (chunks) => <kbd>{chunks}</kbd>,
          })}
        </div>
      </div>
    </div>
  )
}
