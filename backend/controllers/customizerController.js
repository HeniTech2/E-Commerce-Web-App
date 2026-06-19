import prisma from "../prismaClient.js";
import fs from "fs";
import path from "path";

// ── helpers ────────────────────────────────────────────────────────────────────
const deleteFile = (url) => {
  if (!url) return;
  const filename = url.split("/uploads/")[1];
  if (!filename) return;
  const filePath = path.join(process.cwd(), "uploads", filename);
  fs.unlink(filePath, () => {});
};

// ══════════════════════════════════════════════════════════════════════════════
//  NAV ITEMS
// ══════════════════════════════════════════════════════════════════════════════

export const listNav = async (req, res) => {
  try {
    const items = await prisma.navItem.findMany({ orderBy: { order: "asc" } });
    res.json({ success: true, items });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const createNav = async (req, res) => {
  try {
    const { label, href, order, isVisible } = req.body;
    if (!label || !href) return res.json({ success: false, message: "label and href required" });
    const item = await prisma.navItem.create({
      data: { label, href, order: Number(order ?? 0), isVisible: isVisible !== false },
    });
    res.json({ success: true, item });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateNav = async (req, res) => {
  try {
    const { id, label, href, order, isVisible } = req.body;
    const item = await prisma.navItem.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(href !== undefined && { href }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isVisible !== undefined && { isVisible }),
      },
    });
    res.json({ success: true, item });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const deleteNav = async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.navItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const reorderNav = async (req, res) => {
  try {
    const { ids } = req.body;
    await Promise.all(ids.map((id, index) => prisma.navItem.update({ where: { id }, data: { order: index } })));
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
//  FOOTER SECTIONS + LINKS
// ══════════════════════════════════════════════════════════════════════════════

export const listFooter = async (req, res) => {
  try {
    const sections = await prisma.footerSection.findMany({
      orderBy: { order: "asc" },
      include: { links: { orderBy: { order: "asc" } } },
    });
    res.json({ success: true, sections });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const createFooterSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    if (!title) return res.json({ success: false, message: "title required" });
    const section = await prisma.footerSection.create({
      data: { title, order: Number(order ?? 0) },
      include: { links: true },
    });
    res.json({ success: true, section });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateFooterSection = async (req, res) => {
  try {
    const { id, title, order } = req.body;
    const section = await prisma.footerSection.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order: Number(order) }),
      },
      include: { links: { orderBy: { order: "asc" } } },
    });
    res.json({ success: true, section });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const deleteFooterSection = async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.footerSection.delete({ where: { id } }); // cascades links
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const createFooterLink = async (req, res) => {
  try {
    const { sectionId, label, href, order } = req.body;
    if (!sectionId || !label || !href) return res.json({ success: false, message: "sectionId, label, href required" });
    const link = await prisma.footerLink.create({
      data: { sectionId, label, href, order: Number(order ?? 0) },
    });
    res.json({ success: true, link });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateFooterLink = async (req, res) => {
  try {
    const { id, label, href, order } = req.body;
    const link = await prisma.footerLink.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(href !== undefined && { href }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });
    res.json({ success: true, link });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const deleteFooterLink = async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.footerLink.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

export const listSections = async (req, res) => {
  try {
    const sections = await prisma.pageSection.findMany({ orderBy: { order: "asc" } });
    res.json({ success: true, sections });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const { type, title, body, order, isVisible, bgColor, position } = req.body;
    let imageUrl, bgImageUrl;
    if (req.files?.image?.[0]) imageUrl = `${process.env.BASE_URL}/uploads/${req.files.image[0].filename}`;
    if (req.files?.bgImage?.[0]) bgImageUrl = `${process.env.BASE_URL}/uploads/${req.files.bgImage[0].filename}`;
    const section = await prisma.pageSection.create({
      data: {
        type: type || "text",
        title: title || "",
        body: body || "",
        order: Number(order ?? 0),
        isVisible: isVisible !== false && isVisible !== "false",
        position: position || "center",
        bgColor: bgColor || null,
        ...(imageUrl && { imageUrl }),
        ...(bgImageUrl && { bgImageUrl }),
      },
    });
    res.json({ success: true, section });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { id, type, title, body, order, isVisible, bgColor, position, removeImage, removeBgImage } = req.body;
    const existing = await prisma.pageSection.findUnique({ where: { id } });

    let imageUrl;
    if (req.files?.image?.[0]) {
      imageUrl = `${process.env.BASE_URL}/uploads/${req.files.image[0].filename}`;
      if (existing?.imageUrl) deleteFile(existing.imageUrl);
    } else if (removeImage === "true" || removeImage === true) {
      if (existing?.imageUrl) deleteFile(existing.imageUrl);
      imageUrl = "";
    }

    let bgImageUrl;
    if (req.files?.bgImage?.[0]) {
      bgImageUrl = `${process.env.BASE_URL}/uploads/${req.files.bgImage[0].filename}`;
      if (existing?.bgImageUrl) deleteFile(existing.bgImageUrl);
    } else if (removeBgImage === "true" || removeBgImage === true) {
      if (existing?.bgImageUrl) deleteFile(existing.bgImageUrl);
      bgImageUrl = "";
    }

    const section = await prisma.pageSection.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isVisible !== undefined && { isVisible: isVisible === true || isVisible === "true" }),
        ...(position !== undefined && { position }),
        ...(bgColor !== undefined && { bgColor: bgColor || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(bgImageUrl !== undefined && { bgImageUrl: bgImageUrl || null }),
      },
    });
    res.json({ success: true, section });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { id } = req.body;
    const existing = await prisma.pageSection.findUnique({ where: { id } });
    if (existing?.imageUrl) deleteFile(existing.imageUrl);
    if (existing?.bgImageUrl) deleteFile(existing.bgImageUrl);
    await prisma.pageSection.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const reorderSections = async (req, res) => {
  try {
    const { ids } = req.body;
    await Promise.all(ids.map((id, index) => prisma.pageSection.update({ where: { id }, data: { order: index } })));
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
//  LOGO / BRAND SETTINGS
//  Stored in SiteContent with key = "brand_settings"
// ══════════════════════════════════════════════════════════════════════════════

export const getBrand = async (req, res) => {
  try {
    const record = await prisma.siteContent.findUnique({ where: { key: "brand_settings" } });
    if (!record) return res.json({ success: true, brand: { logoUrl: "", brandName: "Marqato", logoText: "MQ" } });
    let brand = { logoUrl: "", brandName: "Marqato", logoText: "MQ" };
    try { brand = { ...brand, ...JSON.parse(record.body || "{}") }; } catch (_) {}
    if (record.image) brand.logoUrl = record.image;
    res.json({ success: true, brand });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { brandName, logoText, removeImage } = req.body;
    let logoUrl;

    // Fetch existing record to handle old image deletion
    const existing = await prisma.siteContent.findUnique({ where: { key: "brand_settings" } });
    let currentBrand = { logoUrl: "", brandName: "Marqato", logoText: "MQ" };
    try { currentBrand = { ...currentBrand, ...JSON.parse(existing?.body || "{}") }; } catch (_) {}
    if (existing?.image) currentBrand.logoUrl = existing.image;

    // Handle new logo upload
    if (req.file) {
      if (currentBrand.logoUrl) deleteFile(currentBrand.logoUrl);
      logoUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    }

    // Handle remove image
    if (removeImage === "true" || removeImage === true) {
      if (currentBrand.logoUrl) deleteFile(currentBrand.logoUrl);
      logoUrl = "";
    }

    const newBrand = {
      logoUrl: logoUrl !== undefined ? logoUrl : currentBrand.logoUrl,
      brandName: brandName !== undefined ? brandName : currentBrand.brandName,
      logoText: logoText !== undefined ? logoText : currentBrand.logoText,
    };

    const record = await prisma.siteContent.upsert({
      where: { key: "brand_settings" },
      update: {
        body: JSON.stringify(newBrand),
        image: newBrand.logoUrl || null,
        title: newBrand.brandName,
      },
      create: {
        key: "brand_settings",
        title: newBrand.brandName,
        body: JSON.stringify(newBrand),
        image: newBrand.logoUrl || null,
        active: true,
      },
    });

    res.json({ success: true, brand: newBrand });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};