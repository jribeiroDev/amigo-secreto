import { useState, useEffect } from "react";
import EventInfo from "./components/EventInfo";
import ParticipantsList from "./components/ParticipantsList";
import { generateSecretSantaMatches } from "./utils/secretSanta";
import { initEmailService, sendAllEmails } from "./services/emailService";
import "./App.css";

const isDebug = import.meta.env.VITE_DEBUG === "true";

function App() {
  const [eventData, setEventData] = useState({
    name: "",
    giftPrice: "",
    date: "",
  });

  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sendingStatus, setSendingStatus] = useState("");

  useEffect(() => {
    initEmailService();
    if (isDebug) {
      console.log("🐛 App em modo DEBUG");
    }
  }, []);

  const handleDraw = () => {
    if (participants.length < 3) {
      alert("É necessário pelo menos 3 participantes para realizar o sorteio!");
      return;
    }

    if (!eventData.name || !eventData.giftPrice) {
      alert("Por favor, preencha as informações do evento!");
      return;
    }

    setIsDrawing(true);

    // Add animation delay
    setTimeout(() => {
      try {
        const secretSantaMatches = generateSecretSantaMatches(participants);
        setMatches(secretSantaMatches);
        setIsDrawing(false);
      } catch (error) {
        alert("Erro ao realizar o sorteio: " + error.message);
        setIsDrawing(false);
      }
    }, 1500);
  };

  const handleSendNotifications = async () => {
    if (!matches) {
      alert("Realize o sorteio primeiro!");
      return;
    }

    const emailParticipants = matches.filter((m) => m.giver.email);
    if (emailParticipants.length === 0) {
      alert("Nenhum participante possui email cadastrado!");
      return;
    }

    setSendingStatus("Enviando notificações...");

    try {
      if (isDebug) {
        console.log(
          "📧 Iniciando envio de emails para",
          emailParticipants.length,
          "participantes"
        );
      }

      const results = await sendAllEmails(eventData, matches);
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      // Verificar se algum erro foi de limite diário
      const limitErrors = results.filter(
        (r) => !r.success && r.error && r.error.includes("LIMITE DIÁRIO")
      );

      if (limitErrors.length > 0) {
        setSendingStatus(
          `⚠️ Limite diário atingido! Enviados: ${successful}/${emailParticipants.length}`
        );
        alert(limitErrors[0].error);
        return;
      }

      setSendingStatus(
        `Emails enviados: ${successful} sucesso, ${failed} falhas`
      );

      if (failed > 0) {
        const failedList = results
          .filter((r) => !r.success)
          .map((r) => `- ${r.participant}: ${r.error}`)
          .join("\n");

        alert(
          `Alguns emails falharam ao enviar:\n\n${failedList}\n\nVerifique o console para mais detalhes.`
        );
        console.error(
          "Failed emails:",
          results.filter((r) => !r.success)
        );
      } else {
        alert(`✅ Todos os ${successful} emails foram enviados com sucesso!`);
      }

      setTimeout(() => setSendingStatus(""), 5000);
    } catch (error) {
      alert("Erro ao enviar notificações: " + error.message);
      setSendingStatus("");
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Tem certeza que deseja resetar o sorteio? Esta ação não pode ser desfeita."
      )
    ) {
      setMatches(null);
      setSendingStatus("");
    }
  };

  const handleNewEvent = () => {
    if (
      confirm(
        "Tem certeza que deseja iniciar um novo evento? Todos os dados serão perdidos."
      )
    ) {
      setEventData({ name: "", giftPrice: "", date: "" });
      setParticipants([]);
      setMatches(null);
      setSendingStatus("");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="icon-gift">🎁</span> Amigo Secreto
        </h1>
        <p>Organize o seu sorteio do amigo secreto de forma fácil e rápida!</p>
      </header>

      <div className="container">
        <EventInfo eventData={eventData} onEventDataChange={setEventData} />

        <ParticipantsList
          participants={participants}
          onParticipantsChange={setParticipants}
        />

        {!matches ? (
          <div className="draw-section">
            <button
              onClick={handleDraw}
              className="btn-primary btn-draw"
              disabled={isDrawing || participants.length < 3}
            >
              {isDrawing ? (
                <>
                  <span className="spinner">⚡</span> Sorteando...
                </>
              ) : (
                <>
                  <span className="icon-dice">🎲</span> Realizar Sorteio
                </>
              )}
            </button>
            {participants.length < 3 && (
              <p className="help-text">
                ⚠️ Adicione pelo menos 3 participantes para realizar o sorteio
              </p>
            )}
          </div>
        ) : (
          <div className="results-section">
            <div className="success-message">
              <h2>
                <span className="icon-check">✨</span> Sorteio Realizado com
                Sucesso!
              </h2>
              <p>
                Os pares foram gerados. Agora você pode enviar as notificações.
              </p>
            </div>

            <div className="notification-buttons">
              <h3>📬 Enviar Notificações:</h3>
              <button
                onClick={handleSendNotifications}
                className="btn-primary"
                disabled={sendingStatus !== ""}
              >
                <span className="icon-email">✉️</span> Enviar Emails
              </button>

              {sendingStatus && (
                <p className="status-message">
                  <span className="icon-loading">⏳</span> {sendingStatus}
                </p>
              )}
            </div>

            <div className="results-info">
              <h3>
                <span className="icon-chart">📊</span> Resumo do Sorteio
              </h3>
              <p>
                <span className="icon-users">👥</span>{" "}
                <strong>Total de participantes:</strong> {participants.length}
              </p>
              <p>
                <span className="icon-email-check">📧</span>{" "}
                <strong>Com email:</strong>{" "}
                {participants.filter((p) => p.email).length}
              </p>
            </div>

            <div className="action-buttons">
              <button onClick={handleReset} className="btn-warning">
                <span className="icon-refresh">🔄</span> Refazer Sorteio
              </button>
              <button onClick={handleNewEvent} className="btn-danger">
                <span className="icon-new">✨</span> Novo Evento
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>
          Desenvolvido com <span className="icon-heart">💜</span> para facilitar
          seu Amigo Secreto
        </p>
        {isDebug && (
          <p className="debug-info">
            <span className="icon-bug">🐛</span> DEBUG MODE ENABLED
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;
