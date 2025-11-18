/**
 * Email service usando SMTP do Gmail
 * Suporta modo desenvolvimento (localhost) e produção (Netlify)
 */

// Detecta ambiente
const isDevelopment = import.meta.env.DEV;
const isDebug = import.meta.env.VITE_DEBUG === "true";

const API_URL = isDevelopment ? "http://localhost:3001/api" : "/api";

if (isDebug) {
  console.log("🐛 DEBUG MODE ENABLED");
  console.log("Environment:", isDevelopment ? "Development" : "Production");
  console.log("API URL:", API_URL);
}

/**
 * Inicializa o serviço de email
 */
export function initEmailService() {
  if (isDebug) {
    console.log("📧 Serviço de email configurado");
    console.log("🔗 API URL:", API_URL);
    console.log("🌍 Ambiente:", isDevelopment ? "Desenvolvimento" : "Produção");
  }
}

/**
 * Envia notificação de email usando SMTP do Gmail
 */
export async function sendEmailNotification(eventData, giver, receiver) {
  if (isDebug) {
    console.log("📧 Enviando email para:", giver.email);
    console.log("Dados:", {
      eventData,
      giver: giver.name,
      receiver: receiver.name,
    });
  }

  try {
    const response = await fetch(`${API_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: giver.email,
        giverName: giver.name,
        receiverName: receiver.name,
        eventName: eventData.name,
        giftPrice: eventData.giftPrice,
        eventDate: eventData.date,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Verificar se é erro de limite diário
      if (data.error === "DAILY_LIMIT_REACHED") {
        throw new Error(
          `⚠️ LIMITE DIÁRIO ATINGIDO\n\n${data.message}\n\nEnviados hoje: ${data.stats.sent}/${data.stats.limit}`
        );
      }

      if (data.error === "INSUFFICIENT_QUOTA") {
        throw new Error(
          `⚠️ LIMITE INSUFICIENTE\n\n${data.message}\n\nDisponíveis: ${data.stats.remaining}\nSolicitados: ${data.stats.requested}`
        );
      }

      throw new Error(data.error || data.message || "Erro ao enviar email");
    }

    if (isDebug) {
      console.log("✅ Email enviado:", data);
      if (data.stats) {
        console.log(
          `📊 Contador: ${data.stats.sent}/${data.stats.limit} (${data.stats.remaining} restantes)`
        );
      }
    }

    return {
      success: true,
      messageId: data.messageId,
      stats: data.stats,
    };
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);

    // Mensagem de erro amigável
    let errorMessage = error.message;
    if (error.message.includes("Failed to fetch")) {
      if (isDevelopment) {
        errorMessage = "Servidor não está rodando. Execute: npm run server";
      } else {
        errorMessage = "Erro de conexão com o servidor";
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Sends email to all participants
 */
export async function sendAllEmails(eventData, matches) {
  if (isDebug) {
    console.log("📧 Enviando emails em lote:", matches.length);
  }

  const results = [];

  for (const match of matches) {
    if (match.giver.email) {
      const result = await sendEmailNotification(
        eventData,
        match.giver,
        match.receiver
      );
      results.push({
        participant: match.giver.name,
        ...result,
      });

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (isDebug) {
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    console.log(`✅ Sucesso: ${successful}, ❌ Falhas: ${failed}`);
  }

  return results;
}
