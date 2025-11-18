import nodemailer from "nodemailer";
import { checkDailyLimit, incrementCounter, getStats } from "./emailCounter.js";

// Função de retry com backoff exponencial
async function sendEmailWithRetry(transporter, mailOptions, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📧 Tentativa ${attempt}/${maxRetries} - Enviando para ${mailOptions.to}`
      );
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado com sucesso para ${mailOptions.to}`);
      return info;
    } catch (error) {
      lastError = error;
      console.error(
        `❌ Tentativa ${attempt}/${maxRetries} falhou:`,
        error.message
      );

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `⏳ Aguardando ${delay / 1000}s antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Falha após ${maxRetries} tentativas: ${lastError.message}`);
}

export const handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("🚀 Iniciando handler de envio de email");

    // Verificar variáveis de ambiente
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ Variáveis de ambiente não configuradas");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Servidor não configurado corretamente",
        }),
      };
    }

    // Verificar limite diário
    console.log("📊 Verificando limite diário...");
    const limitCheck = await checkDailyLimit();

    if (!limitCheck.allowed) {
      console.warn("⚠️ Limite diário atingido");
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          success: false,
          error: "DAILY_LIMIT_REACHED",
          message: `Limite diário de ${limitCheck.limit} emails atingido. Restam ${limitCheck.remaining} emails hoje.`,
          stats: {
            sent: limitCheck.current,
            limit: limitCheck.limit,
            remaining: limitCheck.remaining,
          },
        }),
      };
    }

    console.log("✅ Limite OK:", limitCheck);

    const {
      to,
      subject,
      giverName,
      receiverName,
      eventName,
      giftPrice,
      eventDate,
    } = JSON.parse(event.body);

    // Validação
    if (!to || !giverName || !receiverName || !eventName) {
      console.error("❌ Dados incompletos");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error:
            "Dados incompletos. Necessário: to, giverName, receiverName, eventName",
        }),
      };
    }

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // HTML do email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #667eea;
          }
          .card-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .card-value {
            font-size: 28px;
            font-weight: 700;
            color: #667eea;
          }
          .info-grid {
            background: #fff;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          .info-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f1f3f5;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-icon {
            font-size: 24px;
            margin-right: 12px;
          }
          .info-label {
            font-size: 14px;
            color: #6c757d;
            margin-right: 8px;
          }
          .info-value {
            font-size: 16px;
            color: #212529;
            font-weight: 500;
          }
          .alert {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px 20px;
            border-radius: 8px;
            margin: 24px 0;
            display: flex;
            align-items: center;
          }
          .alert-icon {
            font-size: 24px;
            margin-right: 12px;
          }
          .alert-text {
            font-size: 14px;
            color: #856404;
            font-weight: 500;
          }
          .footer {
            text-align: center;
            padding: 24px;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 13px;
          }
          @media (max-width: 600px) {
            .header h1 {
              font-size: 24px;
            }
            .card-value {
              font-size: 22px;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎁 Amigo Secreto</h1>
            <p>Resultado do Sorteio</p>
          </div>
          
          <div class="content">
            <p class="greeting">Olá, <strong>${giverName}</strong>! 👋</p>
            
            <div class="card">
              <div class="card-label">Você tirou:</div>
              <div class="card-value">${receiverName}</div>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-icon">📋</span>
                <span class="info-label">Evento:</span>
                <span class="info-value">${eventName}</span>
              </div>
              ${
                giftPrice
                  ? `
              <div class="info-item">
                <span class="info-icon">💰</span>
                <span class="info-label">Valor:</span>
                <span class="info-value">€${giftPrice}</span>
              </div>
              `
                  : ""
              }
              ${
                eventDate
                  ? `
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span class="info-label">Data:</span>
                <span class="info-value">${new Date(
                  eventDate
                ).toLocaleDateString("pt-PT")}</span>
              </div>
              `
                  : ""
              }
            </div>
            
            <div class="alert">
              <span class="alert-icon">🤫</span>
              <span class="alert-text">Mantenha segredo! Não revele para ninguém.</span>
            </div>
          </div>
          
          <div class="footer">
            Sorteio realizado em ${new Date().toLocaleDateString("pt-PT")}
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: "Amigo Secreto",
        address: process.env.GMAIL_USER,
      },
      to: to,
      subject: subject || `🎁 Você foi sorteado no ${eventName}!`,
      html: htmlContent,
      text: `
Olá ${giverName}!

Você foi sorteado(a) no Amigo Secreto!

Você tirou: ${receiverName}

Informações do Evento:
📋 Nome: ${eventName}
${giftPrice ? `💰 Valor sugerido: €${giftPrice}` : ""}
${
  eventDate ? `📅 Data: ${new Date(eventDate).toLocaleDateString("pt-PT")}` : ""
}

Lembre-se: mantenha segredo! 🤫

Boas compras!
      `,
    };

    console.log("📧 Enviando email com retry...");

    // Enviar email com retry
    const info = await sendEmailWithRetry(transporter, mailOptions);

    console.log("✅ Email enviado, incrementando contador...");

    // Incrementar contador após envio bem-sucedido
    await incrementCounter();

    const stats = await getStats();

    console.log("✅ Sucesso! Stats:", stats);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        recipient: to,
        stats: stats,
      }),
    };
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
