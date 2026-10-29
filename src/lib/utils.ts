import { createCn } from "cn/config"

//* Teach the merger the design system utilities so it doesn't drop them:
//* `shadow-hard-*` is a shadow size (not a color) and `type-*` sets font size.
export const cn = createCn({
  extend: {
    classGroups: {
      shadow: [
        {
          shadow: [
            "hard-2",
            "hard-3",
            "hard-4",
            "hard-5",
            "hard-6",
            "hard-8",
            "hard-12",
          ],
        },
      ],
      "font-size": [{ type: ["display", "h1", "h2", "h3", "value", "label"] }],
    },
  },
})
