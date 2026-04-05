import { Hono } from "hono";

const analyzeImageRouter = new Hono();

analyzeImageRouter.post("/", async (c) => {
    const body = await c.req.json() as { base64Image?: string; contextDescription?: string };
    const { base64Image, contextDescription } = body;

    if (!base64Image || !contextDescription) {
      return c.json({ error: "base64Image and contextDescription are required" }, 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    const requestPayload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a helpful cleaning assistant. The user has provided context about what needs cleaning: "${contextDescription}"

Looking at this image, provide:
1. A short task name (2-4 words, like "Clean Dishes", "Sweep Floor", "Fold Clothes")
2. A cleaning tip that is EXACTLY 110 characters or less. Make it actionable and specific to what you see. End with "daily smart!"

Example tip format: "Rinse as you go, soak tough pans early, use hot water, and load efficiently to wash dishes fast. daily smart!"

Respond in this exact JSON format:
{"taskName": "short name here", "tip": "your 110 char max tip here ending with daily smart!"}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 256,
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analyze-image] OpenAI error:", errorText);
      return c.json({ error: "AI analysis failed", detail: errorText }, 500);
    }

    const result = await response.json() as any;
    const content = result.choices?.[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return c.json({ error: "Could not parse AI response", raw: content }, 500);
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return c.json({
      taskName: analysis.taskName || "New Chore",
      tip: analysis.tip || "Keep your space clean and organized. daily smart!",
    });
  }
);

export { analyzeImageRouter };
