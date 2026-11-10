export function safeNext(value: string | undefined | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("://") ||
    value.length > 200
  ) {
    return "/profile";
  }
  return value;
}
