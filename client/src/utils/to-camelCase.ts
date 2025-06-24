export function toCamelCase(input: string): string {
  return input
    .toLowerCase()
    .split(/[\s-]+/)
    .map((word, index) =>
      index === 0 ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join("");
}
