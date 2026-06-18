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
    // ids: array of ids in new order
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
    const { type, title, body, order, isVisible } = req.body;
    let imageUrl;
    if (req.file) imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    const section = await prisma.pageSection.create({
      data: {
        type: type || "text",
        title: title || "",
        body: body || "",
        order: Number(order ?? 0),
        isVisible: isVisible !== false && isVisible !== "false",
        ...(imageUrl && { imageUrl }),
      },
    });
    res.json({ success: true, section });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { id, type, title, body, order, isVisible } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
      const existing = await prisma.pageSection.findUnique({ where: { id } });
      if (existing?.imageUrl) deleteFile(existing.imageUrl);
    }
    const section = await prisma.pageSection.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isVisible !== undefined && { isVisible: isVisible === true || isVisible === "true" }),
        ...(imageUrl && { imageUrl }),
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