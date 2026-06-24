import fs from "fs";
import path from "path";
import prisma from "../prismaClient.js";

// list all content blocks (e.g. hero banner, promo bar, announcement)
const listContent = async (req, res) => {
    try {
        const content = await prisma.siteContent.findMany({
            orderBy: { key: "asc" },
        });
        res.json({ success: true, content });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// create or update a content block by its unique key (e.g. "hero", "promo_bar")
const upsertContent = async (req, res) => {
    try {
        const { key, title, subtitle, body, link, active } = req.body;

        if (!key) {
            return res.json({ success: false, message: "key is required" });
        }

        let image;
        if (req.file) {
            image = req.file.path; // Cloudinary returns the full URL in req.file.path
        }

        const existing = await prisma.siteContent.findUnique({ where: { key } });

        // if uploading a new image and an old one exists, remove the old file
        if (image && existing && existing.image) {
            const filename = existing.image.split("/uploads/")[1];
            if (filename) {
                const filePath = path.join(process.cwd(), "uploads", filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.log("Failed to delete old content image:", filePath);
                });
            }
        }

        const data = {
            title: title ?? undefined,
            subtitle: subtitle ?? undefined,
            body: body ?? undefined,
            link: link ?? undefined,
            active: active === undefined ? undefined : active === "true" || active === true,
            ...(image && { image }),
        };

        const content = await prisma.siteContent.upsert({
            where: { key },
            update: data,
            create: { key, ...data },
        });

        res.json({ success: true, message: "Content saved", content });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// delete a content block
const removeContent = async (req, res) => {
    try {
        const { key } = req.body;

        const existing = await prisma.siteContent.findUnique({ where: { key } });

        if (existing && existing.image) {
            const filename = existing.image.split("/uploads/")[1];
            if (filename) {
                const filePath = path.join(process.cwd(), "uploads", filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.log("Failed to delete content image:", filePath);
                });
            }
        }

        await prisma.siteContent.delete({ where: { key } });

        res.json({ success: true, message: "Content removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { listContent, upsertContent, removeContent };