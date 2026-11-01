import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { ICONS } from '../components/icons';
import { AREAS } from '../data/areas';
import { useTitle } from '../lib/hooks';

export default function Areas() {
  useTitle('Obszary życia');
  return (
    <div className="page">
      <PageHeader
        icon="layers"
        title="Transerfing w obszarach życia"
        lead="Te same zasady wyglądają inaczej w pracy, w związku czy przy pieniądzach. Każdy przewodnik pokazuje typowe wahadła i pułapki ważności w danym obszarze, przekłada zasady na konkretne działania i proponuje plan na 7 dni."
      />
      <div className="grid grid-2">
        {AREAS.map((area) => {
          const Icon = ICONS[area.icon];
          return (
            <Link key={area.slug} to={`/obszary/${area.slug}/`} className="card card-link module-card area-card">
              <div className="module-card-icon">
                <Icon size={22} aria-hidden />
              </div>
              <div className="module-card-body">
                <h3>{area.title}</h3>
                <p className="muted">{area.tagline}</p>
                <span className="link-more">
                  Przewodnik i plan na 7 dni <ArrowRight size={16} aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
