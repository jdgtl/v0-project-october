export function formatCategoryName(detailedCategory: string, primaryCategory?: string): string {
  let categoryToFormat = detailedCategory

  if (primaryCategory && detailedCategory.startsWith(primaryCategory + "_")) {
    // Remove the primary prefix and the underscore
    categoryToFormat = detailedCategory.slice(primaryCategory.length + 1)
  }

  // Format the remaining category text
  return categoryToFormat
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
