'use client';

import {
  CAMPAMENTO_RANGO_LABEL,
  getSemanasRequeridas,
  SEMANAS_CAMPAMENTO,
  type SemanaCampamento,
} from '../../lib/campamento-semanas';

interface CampamentoSemanasPickerProps {
  planId: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

function WeekCard({
  semana,
  selected,
  disabled,
  onToggle,
}: {
  semana: SemanaCampamento;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`campamento-week-card${selected ? ' campamento-week-card--selected' : ''}${
        disabled && !selected ? ' campamento-week-card--disabled' : ''
      }`}
      onClick={onToggle}
      disabled={disabled && !selected}
      aria-pressed={selected}
    >
      <span className="campamento-week-emoji">{semana.emoji}</span>
      <span className="campamento-week-num">Semana {semana.numero}</span>
      <span className="campamento-week-dates">{semana.labelCorto}</span>
      <span className="campamento-week-full">{semana.label}</span>
      {selected && <span className="campamento-week-check">✓</span>}
    </button>
  );
}

export default function CampamentoSemanasPicker({
  planId,
  selected,
  onChange,
  error,
}: CampamentoSemanasPickerProps) {
  const requeridas = getSemanasRequeridas(planId);
  const completo = selected.length === requeridas;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
      return;
    }
    if (selected.length >= requeridas) return;
    onChange(
      [...selected, id].sort(
        (a, b) =>
          SEMANAS_CAMPAMENTO.find((s) => s.id === a)!.numero -
          SEMANAS_CAMPAMENTO.find((s) => s.id === b)!.numero
      )
    );
  };

  return (
    <div className="campamento-calendar">
      <div className="campamento-calendar-header">
        <div className="campamento-calendar-title-wrap">
          <span className="campamento-calendar-icon">📅</span>
          <div>
            <p className="campamento-calendar-title">Elige tus semanas</p>
            <p className="campamento-calendar-range">{CAMPAMENTO_RANGO_LABEL}</p>
          </div>
        </div>
        <div
          className={`campamento-calendar-counter${completo ? ' campamento-calendar-counter--done' : ''}`}
        >
          <span className="campamento-calendar-counter-num">
            {selected.length}/{requeridas}
          </span>
          <span className="campamento-calendar-counter-label">
            {requeridas === 1 ? 'semana' : 'semanas'}
          </span>
        </div>
      </div>

      <div className="campamento-calendar-timeline" aria-hidden="true">
        {SEMANAS_CAMPAMENTO.map((semana) => (
          <div
            key={semana.id}
            className={`campamento-timeline-segment${
              selected.includes(semana.id) ? ' campamento-timeline-segment--active' : ''
            }`}
          >
            <span>S{semana.numero}</span>
          </div>
        ))}
      </div>

      <p className="campamento-calendar-hint">
        {requeridas === 1
          ? 'Toca la semana en la que participará 🙌'
          : requeridas === 4
            ? 'Selecciona las 4 semanas del campamento 🏕️'
            : `Elige ${requeridas} semanas — las que mejor le acomoden ✨`}
      </p>

      <div className="campamento-week-grid">
        {SEMANAS_CAMPAMENTO.map((semana) => (
          <WeekCard
            key={semana.id}
            semana={semana}
            selected={selected.includes(semana.id)}
            disabled={!selected.includes(semana.id) && selected.length >= requeridas}
            onToggle={() => toggle(semana.id)}
          />
        ))}
      </div>

      {error && <p className="campamento-error campamento-calendar-error">{error}</p>}
    </div>
  );
}
