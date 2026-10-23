export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Only POST requests are allowed." },
      { status: 405 }
    );
  }

  try {
    const { message, personality } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
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

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions: `You are the ACUTIL AI assistant.

${style}

Answer the user's question naturally and helpfully.`,
        input: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return Response.json(
        { error: "The AI service returned an error." },
        { status: response.status }
      );
    }

    return Response.json({
      reply: data.output_text || "I couldn't generate a response.",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
