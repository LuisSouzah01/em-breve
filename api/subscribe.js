export default async function handler(req, res) {
  // Bloqueia qualquer tentativa que não seja um envio de formulário (POST)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório" });
  }

  try {
    // 1. SALVA O CONTATO NA LISTA (Audience)
    await fetch("https://api.resend.com/contacts", {
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

    // 2. DISPARA O E-MAIL PREMIUM DIRETAMENTE
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // O formato obrigatório: Nome <email@dominio-verificado.com>
        from: "ZyncDeck <team@zyncdeck.com>",
        to: [email],
        subject: "Your spot is secured.",
        html: `
          <div style="font-family: Arial, sans-serif; color: #1A0D25; max-width: 600px;">
            <h2 style="color: #7A3CDD;">You're on the list.</h2>
            <p>Thank you for securing your spot in the ZyncDeck waitlist.</p>
            <p>We are building the ultimate white-label client portal to help agencies replace messy email threads, lost Drive links, and fragmented communication with a single, premium experience.</p>
            <p>You will be one of the first to know when we open our doors for early access.</p>
            <br>
            <p>Talk soon,<br><strong>Luis Souzah</strong><br>Founder,<br>ZyncDeck</p>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    // Se o Resend bloquear o envio, ele devolve o erro para o Front-End
    if (!emailResponse.ok) {
      console.log("ERRO AO ENVIAR E-MAIL:", emailData);
      return res.status(400).json(emailData);
    }

    // Retorna sucesso para a animação verde aparecer na tela!
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERRO INTERNO NO SERVIDOR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
