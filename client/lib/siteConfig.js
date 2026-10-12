export const siteConfig = {
  shortName: "RIC",
  centerName: "Research & Innovation Center",
  institutionName: "University", // এখানে তুমি যখনই নাম বদলাবে, সব জায়গায় বদলে যাবে
  tagline: "Where proposals become projects.",
  description: "Submit, review, and track research at University — all in one place.",
};

// এই ম্যাজিক ফাংশনটি পুরো প্রজেক্টের যেকোনো টেক্সট থেকে পুরনো নামগুলো ধরে স্বয়ংক্রিয়ভাবে নতুন নাম বসিয়ে দেবে
export function formatText(text) {
  if (!text) return "";
  return text
    .replace(/Khulna University/g, siteConfig.institutionName)
    .replace(/KURIC/g, siteConfig.shortName);
}