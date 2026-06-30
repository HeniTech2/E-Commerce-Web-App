import prisma from "../prismaClient.js";

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
    await prisma.footerSection.delete({ where: { id } });
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
    const { type, title, body, order, isVisible, bgColor, position, imagePosition } = req.body;

    let imageUrl, image2Url, image3Url, image4Url, bgImageUrl, videoUrl;
    if (req.files?.image?.[0])    imageUrl   = req.files.image[0].path;
    if (req.files?.image2?.[0])   image2Url  = req.files.image2[0].path;
    if (req.files?.image3?.[0])   image3Url  = req.files.image3[0].path;
    if (req.files?.image4?.[0])   image4Url  = req.files.image4[0].path;
    if (req.files?.bgImage?.[0])  bgImageUrl = req.files.bgImage[0].path;
    if (req.files?.video?.[0])    videoUrl   = req.files.video[0].path;

    const section = await prisma.pageSection.create({
      data: {
        type: type || "text",
        title: title || "",
        body: body || "",
        order: Number(order ?? 0),
        isVisible: isVisible !== false && isVisible !== "false",
        position: position || "center",
        imagePosition: imagePosition || "center",
        bgColor: bgColor || null,
        ...(imageUrl   && { imageUrl }),
        ...(image2Url  && { image2Url }),
        ...(image3Url  && { image3Url }),
        ...(image4Url  && { image4Url }),
        ...(bgImageUrl && { bgImageUrl }),
        ...(videoUrl   && { videoUrl }),
      },
    });
    res.json({ success: true, section });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const {
      id, type, title, body, order, isVisible, bgColor, position, imagePosition,
      removeImage, removeImage2, removeImage3, removeImage4, removeBgImage, removeVideo,
    } = req.body;

    await prisma.pageSection.findUnique({ where: { id } });

    let imageUrl;
    if (req.files?.image?.[0])       imageUrl  = req.files.image[0].path;
    else if (removeImage  === "true") imageUrl  = "";

    let image2Url;
    if (req.files?.image2?.[0])      image2Url = req.files.image2[0].path;
    else if (removeImage2 === "true") image2Url = "";

    let image3Url;
    if (req.files?.image3?.[0])      image3Url = req.files.image3[0].path;
    else if (removeImage3 === "true") image3Url = "";

    let image4Url;
    if (req.files?.image4?.[0])      image4Url = req.files.image4[0].path;
    else if (removeImage4 === "true") image4Url = "";

    let bgImageUrl;
    if (req.files?.bgImage?.[0])     bgImageUrl = req.files.bgImage[0].path;
    else if (removeBgImage === "true") bgImageUrl = "";

    let videoUrl;
    if (req.files?.video?.[0])       videoUrl = req.files.video[0].path;
    else if (removeVideo === "true")  videoUrl = "";

    const section = await prisma.pageSection.update({
      where: { id },
      data: {
        ...(type          !== undefined && { type }),
        ...(title         !== undefined && { title }),
        ...(body          !== undefined && { body }),
        ...(order         !== undefined && { order: Number(order) }),
        ...(isVisible     !== undefined && { isVisible: isVisible === true || isVisible === "true" }),
        ...(position      !== undefined && { position }),
        ...(imagePosition !== undefined && { imagePosition }),
        ...(bgColor       !== undefined && { bgColor: bgColor || null }),
        ...(imageUrl      !== undefined && { imageUrl:  imageUrl  || null }),
        ...(image2Url     !== undefined && { image2Url: image2Url || null }),
        ...(image3Url     !== undefined && { image3Url: image3Url || null }),
        ...(image4Url     !== undefined && { image4Url: image4Url || null }),
        ...(bgImageUrl    !== undefined && { bgImageUrl: bgImageUrl || null }),
        ...(videoUrl      !== undefined && { videoUrl: videoUrl || null }),
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

    const existing = await prisma.siteContent.findUnique({ where: { key: "brand_settings" } });
    let currentBrand = { logoUrl: "", brandName: "Marqato", logoText: "MQ" };
    try { currentBrand = { ...currentBrand, ...JSON.parse(existing?.body || "{}") }; } catch (_) {}
    if (existing?.image) currentBrand.logoUrl = existing.image;

    if (req.file) {
      logoUrl = req.file.path;
    }

    if (removeImage === "true" || removeImage === true) {
      logoUrl = "";
    }

    const newBrand = {
      logoUrl: logoUrl !== undefined ? logoUrl : currentBrand.logoUrl,
      brandName: brandName !== undefined ? brandName : currentBrand.brandName,
      logoText: logoText !== undefined ? logoText : currentBrand.logoText,
    };

    await prisma.siteContent.upsert({
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