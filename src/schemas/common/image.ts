//* Libraries imports
import z from "zod";

//* Local imports
import { env } from "@/src/env/client";
import { concatUrl } from "@/src/utils/url";

//image can came frrom the API ("https://images.ygoprodeck.com/images/cards/1234567890.jpg")
// or in the back-end ("/images/1234567890.jpg")
// we need to validate the image path and accept both formats
export const imageSchema = z
.string()
.transform((value) => {
    if (value.startsWith("http")) {
        return value;
    }
    return concatUrl(env.NEXT_PUBLIC_BACKEND_URL, value);
});