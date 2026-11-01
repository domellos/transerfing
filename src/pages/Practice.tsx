import { Link } from 'react-router';
import { PageHeader } from '../components/ui';
import { ICONS } from '../components/icons';
import { TOOLS, TOOL_GROUPS } from '../data/tools';
import { useTitle } from '../lib/hooks';

export default function Practice() {
  useTitle('Praktyka');
  return (
    <div className="page">
      <PageHeader
        icon="sparkles"
        title="Praktyka"
        lead="Narzędzia, które przenoszą zasady Transerfingu do codzienności. Każde zapisuje wyniki w twoim dzienniku, dzięki czemu po kilku tygodniach zobaczysz, co naprawdę działa."
      />
      {TOOL_GROUPS.map((group) => (
        <section key={group.id} className="section">
          <h2 className="section-title">{group.title}</h2>
          <p className="muted">{group.description}</p>
          <div className="grid grid-3">
            {TOOLS.filter((t) => t.group === group.id).map((tool) => {
              const Icon = ICONS[tool.icon];
              return (
                <Link key={tool.id} to={`/praktyka/${tool.id}/`} className="card card-link tool-card">
                  <div className="tool-card-top">
                    <Icon size={22} aria-hidden className="tool-card-icon" />
                    <span className="badge">{tool.time}</span>
                  </div>
                  <h3>{tool.title}</h3>
                  <p className="muted">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
