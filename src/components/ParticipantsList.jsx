import { useState } from "react";
import "./ParticipantsList.css";

function ParticipantsList({ participants, onParticipantsChange }) {
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
  });

  const handleAddParticipant = () => {
    if (newParticipant.name && newParticipant.email) {
      onParticipantsChange([
        ...participants,
        { ...newParticipant, id: Date.now() },
      ]);
      setNewParticipant({ name: "", email: "" });
    } else {
      alert("Por favor, preencha o nome e email!");
    }
  };

  const handleRemoveParticipant = (id) => {
    onParticipantsChange(participants.filter((p) => p.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddParticipant();
    }
  };

  return (
    <div className="participants-list">
      <h2>
        <span className="icon-people">👥</span> Participantes (
        {participants.length})
      </h2>

      <div className="add-participant">
        <div className="input-row">
          <input
            type="text"
            placeholder="👤 Nome completo"
            value={newParticipant.name}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, name: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
          <input
            type="email"
            placeholder="📧 Email"
            value={newParticipant.email}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, email: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleAddParticipant} className="btn-add">
            <span className="icon-plus">➕</span> Adicionar
          </button>
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="empty-message">
          <span className="icon-empty">📭</span> Nenhum participante adicionado
          ainda.
        </p>
      ) : (
        <div className="participants-grid">
          {participants.map((participant) => (
            <div key={participant.id} className="participant-card">
              <div className="participant-info">
                <h3>
                  <span className="icon-user">👤</span> {participant.name}
                </h3>
                <p className="contact">
                  <span className="icon-mail">✉️</span> {participant.email}
                </p>
              </div>
              <button
                onClick={() => handleRemoveParticipant(participant.id)}
                className="btn-remove"
                title="Remover participante"
              >
                <span className="icon-trash">🗑️</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {participants.length > 0 && participants.length < 3 && (
        <p className="warning-message">
          <span className="icon-warning">⚠️</span> Adicione pelo menos 3
          participantes para realizar o sorteio.
        </p>
      )}
    </div>
  );
}

export default ParticipantsList;
