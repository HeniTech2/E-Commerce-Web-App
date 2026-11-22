import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith("video/");
        return {
            folder: "marqato",
            resource_type: isVideo ? "video" : "image",
            allowed_formats: isVideo
                ? ["mp4", "mov", "avi", "webm", "mkv"]
                : ["jpg", "jpeg", "png", "webp", "jfif"],
        };
    },
});

// Admin uploads (product photos/videos, site images)
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
});

// Customer payment proof: one small image only
const imageOnly = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    const error = new Error("Only image files are allowed for the payment screenshot.");
    error.status = 400;
    cb(error);
};

export const proofUpload = multer({
    storage: storage,
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    fileFilter: imageOnly,
});

export default upload;