// utils/slugify.ts
export const slugify = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[().]/g, "")           // Remove parentheses, dots
      .replace(/[^a-z0-9]+/g, "-")     // Replace non-alphanumerics with hyphen
      .replace(/(^-|-$)/g, "");        // Trim starting/ending hyphen
  };
  