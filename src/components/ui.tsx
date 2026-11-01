import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { ICONS } from './icons';
import { MODULE_BY_ID } from '../data/modules';
import type { IconName, ModuleId } from '../types';

export function PageHeader({
  eyebrow,
  title,
  lead,
  icon,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  icon?: IconName;
  actions?: ReactNode;
}) {
  const Icon = icon ? ICONS[icon] : null;
  return (
    <header className="page-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="page-header-row">
        <h1>
          {Icon && <Icon className="page-header-icon" aria-hidden size={30} />}
          {title}
        </h1>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

export function moduleStyle(module: ModuleId): CSSProperties {
  return { '--hue': MODULE_BY_ID[module].hue } as CSSProperties;
}

export function ModuleChip({ module, link = false }: { module: ModuleId; link?: boolean }) {
  const def = MODULE_BY_ID[module];
  const content = <span className="chip chip-module" style={moduleStyle(module)}>{def.short}</span>;
  return link ? <Link to={`/wiedza/?modul=${module}`}>{content}</Link> : content;
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  const Icon = ICONS[icon];
  return (
    <div className="empty">
      <Icon size={32} aria-hidden />
      <p className="empty-title">{title}</p>
      {children && <div className="empty-text">{children}</div>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function Scale5({
  value,
  onChange,
  low,
  high,
  label,
}: {
  value?: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
  label: string;
}) {
  return (
    <div className="scale5" role="radiogroup" aria-label={label}>
      <span className="scale5-end">{low}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${label}: ${n} z 5`}
          className={`scale5-dot ${value === n ? 'is-active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <span className="scale5-end">{high}</span>
    </div>
  );
}

export function Stat({ value, label, icon }: { value: ReactNode; label: string; icon?: IconName }) {
  const Icon = icon ? ICONS[icon] : null;
  return (
    <div className="stat">
      {Icon && <Icon size={18} aria-hidden className="stat-icon" />}
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'tip'; title?: string; children: ReactNode }) {
  return (
    <div className={`callout callout-${tone}`}>
      {title && <p className="callout-title">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

/** Kontakty pomocowe pokazywane, gdy ktoś pisze o kryzysie, przemocy albo zagrożeniu życia. */
export function CrisisCard() {
  return (
    <div className="callout callout-warn crisis" role="alert">
      <p className="callout-title">Jeśli jest ci bardzo ciężko, nie zostawaj z tym sam/sama</p>
      <p>Ten serwis nie jest miejscem na pomoc w kryzysie, ale są ludzie, którzy mogą pomóc od razu:</p>
      <ul className="bullets">
        <li>
          <strong>112</strong>: numer alarmowy, gdy życie lub zdrowie jest zagrożone.
        </li>
        <li>
          <strong>800 70 2222</strong>: Centrum Wsparcia dla Osób Dorosłych w Kryzysie Psychicznym, całodobowo i bezpłatnie.
        </li>
        <li>
          <strong>116 111</strong>: telefon zaufania dla dzieci i młodzieży, całodobowo i bezpłatnie.
        </li>
        <li>
          <strong>800 12 00 02</strong>: „Niebieska Linia” dla osób doznających przemocy domowej.
        </li>
      </ul>
    </div>
  );
}

/** Mały wykres słupkowy dla ostatnich dni. */
export function MiniBars({ data, max }: { data: { label: string; value: number; title?: string }[]; max?: number }) {
  const top = Math.max(1, max ?? Math.max(...data.map((d) => d.value)));
  return (
    <div className="minibars">
      {data.map((d, i) => (
        <div key={i} className="minibar" title={d.title ?? `${d.label}: ${d.value}`}>
          <div className="minibar-track">
            <div className="minibar-fill" style={{ height: `${Math.round((d.value / top) * 100)}%` }} />
          </div>
          <span className="minibar-value">{d.value || ''}</span>
          <span className="minibar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
