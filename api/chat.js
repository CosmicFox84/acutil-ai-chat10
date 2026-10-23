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

    if (personality <= 33) {
      style =
        "Be direct, concise and straightforward. Give clear answers without unnecessary friendliness.";
    } else if (personality <= 66) {
      style =
        "Be balanced, helpful and warm. Be clear and friendly, but not overly casual.";
    } else {
      style =
        "Be very friendly, encouraging and empathetic. Make the conversation warm and supportive while remaining useful and clear.";
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
