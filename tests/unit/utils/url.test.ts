//* Libraries imports
import { describe, it, expect } from "vitest";

//* Local imports
import { concatUrl } from "@/src/utils/url";

describe("concatUrl", () => {
    it("should concatenate a base URL with a path", () => {
        expect(concatUrl("https://example.com", "path/to/file.jpg")).toBe("https://example.com/path/to/file.jpg");
        expect(concatUrl("https://example.com", "/path/to/file.jpg")).toBe("https://example.com/path/to/file.jpg");
        expect(concatUrl("https://example.com/", "path/to/file.jpg")).toBe("https://example.com/path/to/file.jpg");
        expect(concatUrl("https://example.com/", "/path/to/file.jpg")).toBe("https://example.com/path/to/file.jpg");
    });
});