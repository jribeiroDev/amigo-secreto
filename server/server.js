import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import { checkDailyLimit, incrementCounter, getStats } from "./emailCounter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configurar transporter do Nodemailer com Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verificar conexão SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro ao conectar ao Gmail SMTP:", error);
  } else {
    console.log("✅ Servidor pronto para enviar emails via Gmail");
  }
});

// Função de retry com backoff exponencial
async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
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
        // Backoff exponencial: 2s, 4s, 8s...
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

// Endpoint para enviar email único
app.post("/api/send-email", async (req, res) => {
  try {
    // Verificar limite diário
    const limitCheck = checkDailyLimit();

    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: "DAILY_LIMIT_REACHED",
        message: `Limite diário de ${limitCheck.limit} emails atingido. Restam ${limitCheck.remaining} emails hoje.`,
        stats: {
          sent: limitCheck.current,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
        },
      });
    }

    const {
      to,
      subject,
      giverName,
      receiverName,
      eventName,
      giftPrice,
      eventDate,
    } = req.body;

    // Validação
    if (!to || !giverName || !receiverName || !eventName) {
      return res.status(400).json({
        success: false,
        error:
          "Dados incompletos. Necessário: to, giverName, receiverName, eventName",
      });
    }

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

    // Configurar email
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
${giftPrice ? `💰 Valor sugerido: € ${giftPrice}` : ""}
${
  eventDate ? `📅 Data: ${new Date(eventDate).toLocaleDateString("pt-BR")}` : ""
}

Lembre-se: mantenha segredo! 🤫

Boas compras!
      `,
    };

    // Enviar email com retry
    const info = await sendEmailWithRetry(mailOptions);

    // Incrementar contador após envio bem-sucedido
    incrementCounter();

    res.json({
      success: true,
      messageId: info.messageId,
      recipient: to,
      stats: getStats(),
    });
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para enviar múltiplos emails
app.post("/api/send-batch-emails", async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Array de emails inválido",
      });
    }

    // Verificar se há emails suficientes no limite
    const limitCheck = checkDailyLimit();
    if (limitCheck.remaining < emails.length) {
      return res.status(429).json({
        success: false,
        error: "INSUFFICIENT_QUOTA",
        message: `Limite insuficiente. Você pode enviar ${limitCheck.remaining} emails hoje, mas tentou enviar ${emails.length}.`,
        stats: {
          sent: limitCheck.current,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          requested: emails.length,
        },
      });
    }

    const results = [];

    // Enviar cada email com retry e delay
    for (const emailData of emails) {
      try {
        // Verificar limite antes de cada email
        const check = checkDailyLimit();
        if (!check.allowed) {
          results.push({
            recipient: emailData.to,
            success: false,
            error: "Limite diário atingido",
          });
          continue;
        }

        const result = await sendSingleEmail(emailData);

        // Incrementar contador apenas se envio bem-sucedido
        incrementCounter();

        results.push({
          recipient: emailData.to,
          success: true,
          messageId: result.messageId,
        });

        // Delay de 1 segundo entre emails para não sobrecarregar o servidor
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `❌ Falha ao enviar para ${emailData.to} após todas as tentativas:`,
          error.message
        );
        results.push({
          recipient: emailData.to,
          success: false,
          error: error.message,
        });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    res.json({
      success: true,
      total: emails.length,
      successful,
      failed,
      results,
      stats: getStats(),
    });
  } catch (error) {
    console.error("❌ Erro ao enviar lote de emails:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Função auxiliar para enviar email único
async function sendSingleEmail(data) {
  const {
    to,
    subject,
    giverName,
    receiverName,
    eventName,
    giftPrice,
    eventDate,
  } = data;

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
              <span class="info-value">${new Date(eventDate).toLocaleDateString(
                "pt-PT"
              )}</span>
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
  };

  return await sendEmailWithRetry(mailOptions);
}

// Endpoint de teste
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor de email funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint para verificar estatísticas
app.get("/api/stats", (req, res) => {
  const stats = getStats();
  res.json({
    success: true,
    ...stats,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📧 Email: ${process.env.GMAIL_USER || "NÃO CONFIGURADO"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);

  // Mostrar estatísticas ao iniciar
  const stats = getStats();
  console.log(
    `📊 Limite de emails: ${stats.sent}/${stats.limit} (${stats.remaining} restantes)`
  );
});
