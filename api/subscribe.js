export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Nova API do Resend: Direto para /contacts (Sem usar Audience ID!)
    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        unsubscribed: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("ERRO DO RESEND:", data);
      return res.status(400).json(data);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERRO INTERNO:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
