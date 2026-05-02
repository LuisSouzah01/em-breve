export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // 1. Salva o contato silenciosamente na lista (Audience)
    await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, unsubscribed: false }),
    });

    // 2. Dispara o gatilho (Evento) para acionar a Automação no Resend
    const eventResponse = await fetch("https://api.resend.com/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "waitlist.joined",
        data: {
          email: email, // A propriedade exata que configuramos no seu print!
        },
      }),
    });

    if (!eventResponse.ok) {
      console.log("ERRO AO DISPARAR EVENTO:", await eventResponse.json());
    }

    // Retorna sucesso para o Front-End liberar a animação
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERRO INTERNO NO SERVIDOR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
