
/**
 * Concatenates a base URL with a path.
 * @param base - The base URL.
 * @param path - The path to concatenate.
 * @returns The concatenated URL.
 * 
 * @example
 * concatUrl("https://example.com", "path/to/file.jpg") // "https://example.com/path/to/file.jpg"
 * concatUrl("https://example.com", "/path/to/file.jpg") // "https://example.com/path/to/file.jpg"
 * concatUrl("https://example.com", "path/to/file.jpg") // "https://example.com/path/to/file.jpg"
 * concatUrl("https://example.com", "/path/to/file.jpg") // "https://example.com/path/to/file.jpg"
 */

export function concatUrl(base: string, path: string): string {
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${normalizedBase}/${normalizedPath}`;
}