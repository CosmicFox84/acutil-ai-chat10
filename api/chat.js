export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  try {
    const { message, personality } = request.body || {};

    if (!message || typeof message !== "string") {
      return response.status(400).json({
        error: "Message is required."
      });
    }

    let style;

    if (personality <= 0.3) {
  style =
    "Use low-temperature behavior. Be predictable, factual, concise and straightforward. Focus on solving the user's problem. Avoid unnecessary creativity, jokes or unusual ideas.";
} else if (personality <= 0.7) {
  style =
    "Use medium-temperature behavior. Be clear, helpful and balanced. Add a small amount of creativity when useful, while staying practical.";
} else {
  style =
    "Use high-temperature behavior. Be creative, playful and imaginative. Brainstorm freely, use humor when appropriate, and offer unconventional ideas while still answering the user's question.";
}

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-6-luna",
          instructions: `You are the ACUTIL AI assistant.

${style}

Answer the user's question naturally and helpfully.`,
          input: message
        })
      }
    );

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      console.error(data);

      return response.status(openAIResponse.status).json({
        error: data.error?.message || "The AI service returned an error."
      });
    }

    const reply =
  data.output_text ||
  data.output
    ?.flatMap(item => item.content || [])
    .find(item => item.type === "output_text")
    ?.text ||
  "I couldn't generate a response.";

return response.status(200).json({
  reply: reply
});

  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Something went wrong."
    });
  }
}
