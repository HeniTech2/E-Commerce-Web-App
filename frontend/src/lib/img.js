// Cloudinary: ask for automatic format/quality and a specific width.
// Any other URL (Unsplash, etc.) is returned unchanged.
const isCloudinary = (url) =>
  typeof url === "string" &&
  url.includes("res.cloudinary.com") &&
  url.includes("/upload/");

export const optimize = (url, width = 600) => {
  if (!isCloudinary(url)) return url;
  if (url.includes("/upload/f_auto")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

export const srcSet = (url, widths = [400, 800, 1200]) => {
  if (!isCloudinary(url)) return undefined;
  return widths.map((w) => `${optimize(url, w)} ${w}w`).join(", ");
};