import prisma from "../prismaClient.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// ── Build a compact, up-to-date snapshot of the catalog ────────────
const buildStoreContext = async () => {

    const products = await prisma.product.findMany({
        select: {
            name: true,
            price: true,
            category: true,
            subCategory: true,
            stock: true,
            bestseller: true,
        },
        orderBy: { date: "desc" },
        take: 40,
    });

    const catalogLines = products.map((p) => {
        const stockNote = p.stock <= 0 ? "OUT OF STOCK" : `${p.stock} in stock`;
        const star = p.bestseller ? " (bestseller)" : "";
        return `- ${p.name} | ${p.category} / ${p.subCategory} | ${p.price} ETB | ${stockNote}${star}`;
    });

    return catalogLines.join("\n");
};


// ── POST /api/chat/message ──────────────────────────────────────────
const chatWithAssistant = async (req, res) => {
    try {

        if (!GEMINI_API_KEY) {
            return res.json({
                success: false,
                message: "AI assistant is not configured yet. Add GEMINI_API_KEY to the backend .env file.",
            });
        }

        const { message, history } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.json({
                success: false,
                message: "Message is required.",
            });
        }

        const catalog = await buildStoreContext();

        const systemInstruction = {
            parts: [
                {
                    text:
                        "You are Selam, the friendly AI shopping assistant for Marqato, an Ethiopian e-commerce marketplace. " +
                        "You help customers find products, compare prices, check stock, and understand shipping, payment " +
                        "(Chapa, Cash on Delivery, CBE bank transfer) and order status questions. " +
                        "Always answer in the same language the customer writes in (English or Amharic). " +
                        "Keep replies short, warm and helpful — a few sentences, simple formatting, no long essays. " +
                        "Only recommend products that appear in the CURRENT CATALOG below. Never invent products, prices or stock numbers. " +
                        "If something isn't in the catalog or you're unsure, say so honestly and suggest browsing the Shop page. " +
                        "You cannot place orders, process payments, or access a specific customer's account — for that, " +
                        "direct them to the Cart, Checkout, or Orders pages.\n\n" +
                        "CURRENT CATALOG:\n" +
                        (catalog || "No products available right now."),
                },
            ],
        };

        const contents = [
            ...(Array.isArray(history) ? history.slice(-10) : []).map((h) => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: String(h.text || "").slice(0, 2000) }],
            })),
            {
                role: "user",
                parts: [{ text: message.slice(0, 2000) }],
            },
        ];

        const geminiRes = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: systemInstruction,
                contents,
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 400,
                },
            }),
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            console.error("Gemini API error:", data);
            return res.json({
                success: false,
                message: "AI assistant is temporarily unavailable. Please try again shortly.",
            });
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
            "Sorry, I couldn't come up with a reply. Could you rephrase that?";

        res.json({ success: true, reply });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export default chatWithAssistant;