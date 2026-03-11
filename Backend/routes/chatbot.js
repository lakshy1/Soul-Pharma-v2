const express = require("express");
const focusAreas = require("../data/focus.seed.json");
const newsItems = require("../data/news.seed.json");

const router = express.Router();
const fetchImpl =
  typeof fetch === "function"
    ? fetch
    : (...args) => import("node-fetch").then((mod) => mod.default(...args));

const buildKnowledgeBase = () => {
  const focusSummary = focusAreas
    .map((item) => `${item.title}: ${item.medicines.join(", ")}`)
    .join("; ");

  const newsSummary = newsItems
    .map(
      (item) =>
        `${item.title} (${item.category}, ${item.publishedAt}): ${item.summary}`
    )
    .join("; ");

  return `
Soul Pharma overview:
- Founded in 2003. Headquarters: Nagpur, Maharashtra, India.
- Focused on reliable, affordable formulations and WHO-aligned quality discipline.
- Core therapeutic focus: Neuro-Psychiatry, Anti-Infective, Gynecology, Orthopedics, Vitamins & Minerals, Pediatrics.
- Presence: 20+ cities across Maharashtra, Madhya Pradesh, and Chhattisgarh.
- Vision: globally respected partner for dependable quality and healthcare accessibility.
- Mission: deliver reliable, economical formulations with scientific rigor and patient-centric execution.
- CSR: healthcare education, equitable access, and responsible operations.

Contact and support:
- Phone: +91 9595260505
- Email: Soulpharmangp@gmail.com
- Address: Opposite Acharaj Tower, Chhaoni, Nagpur 440030
- Business hours: 11:00 AM - 7:00 PM IST, Monday to Saturday.
- Contact page offers a form with topics: General Inquiry, Distribution, Careers, Media.

Platform pages:
- Home: highlights therapeutic focus areas and presence map.
- About: vision, mission, milestones, leadership focus, quality discipline.
- Business: therapy portfolio, focus cards, business assistance CTA.
- Careers: hiring info and growth opportunities.
- Newsroom: company updates and events.
- Contact: support channels and contact form.
- Auth: employee portal, login/signup, OTP reset flows.

Therapy portfolio and sample medicines:
${focusSummary}

News highlights:
${newsSummary}
  `.trim();
};

const systemPrompt = `
You are SOUL AI, the official, polite, and helpful assistant for Soul Pharma.
Your job is to guide visitors about Soul Pharma, its platform pages, offerings, careers, and contact options.
Always be concise, warm, and respectful. Ask a clarifying question when the user intent is unclear.
If asked about medical advice, prescriptions, or treatment decisions, politely refuse and suggest consulting a healthcare professional.
If asked for off-platform topics, provide a brief answer and gently redirect to Soul Pharma where relevant.

Use the following knowledge base as the source of truth and avoid inventing details:

${buildKnowledgeBase()}
`.trim();

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) {
    return [];
  }
  return messages
    .filter((message) => message && typeof message.content === "string")
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }],
    }));
};

router.post("/message", async (req, res) => {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key missing" });
    }

    const { messages } = req.body || {};
    const history = normalizeMessages(messages);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        ...history,
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 512,
      },
    };

    const model = (process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
    const apiVersion = (process.env.GEMINI_API_VERSION || "v1").trim();
    const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        message: "Gemini API error",
        detail: errorText.slice(0, 500),
      });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "Sorry, I could not generate a response right now.";

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({
      message: "Chatbot request failed",
      detail: error?.message || "Unknown error",
    });
  }
});

router.get("/models", async (req, res) => {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key missing" });
    }
    const apiVersion = (process.env.GEMINI_API_VERSION || "v1").trim();
    const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;
    const response = await fetchImpl(endpoint);
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        message: "Gemini API error",
        detail: errorText.slice(0, 500),
      });
    }
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Model list failed",
      detail: error?.message || "Unknown error",
    });
  }
});

module.exports = router;
