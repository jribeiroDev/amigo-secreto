import { useState } from "react";
import "./EventInfo.css";

function EventInfo({ eventData, onEventDataChange }) {
  return (
    <div className="event-info">
      <h2>
        <span className="icon-calendar">📅</span> Informações do Evento
      </h2>
      <div className="form-group">
        <label htmlFor="eventName">
          <span className="icon-tag">🏷️</span> Nome do Evento:
        </label>
        <input
          type="text"
          id="eventName"
          value={eventData.name}
          onChange={(e) =>
            onEventDataChange({ ...eventData, name: e.target.value })
          }
          placeholder="Ex: Amigo Secreto da Família 2025"
        />
      </div>
      <div className="form-group">
        <label htmlFor="giftPrice">
          <span className="icon-money">💰</span> Valor do Presente (€):
        </label>
        <input
          type="number"
          id="giftPrice"
          value={eventData.giftPrice}
          onChange={(e) =>
            onEventDataChange({ ...eventData, giftPrice: e.target.value })
          }
          placeholder="Ex: 50.00"
          step="0.01"
          min="0"
        />
      </div>
      <div className="form-group">
        <label htmlFor="eventDate">
          <span className="icon-date">📆</span> Data do Evento:
        </label>
        <input
          type="date"
          id="eventDate"
          value={eventData.date}
          onChange={(e) =>
            onEventDataChange({ ...eventData, date: e.target.value })
          }
        />
      </div>
    </div>
  );
}

export default EventInfo;
