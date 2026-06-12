export const formatRelativeTime = (dateStr: string, language: string): string => {
  const locale = language === "en" ? "en-US" : "fr-FR";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 1) {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: "short" });
  }
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
};

export const formatMessageTime = (dateStr: string, language: string): string => {
  const locale = language === "en" ? "en-US" : "fr-FR";
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};
