import { Link, useParams } from 'react-router';
import { BookOpen } from 'lucide-react';
import { TOOL_BY_ID, JOURNALS } from '../data/tools';
import { LESSON_BY_SLUG } from '../data/lessons';
import { PageHeader } from '../components/ui';
import { useTitle } from '../lib/hooks';
import NotFound from './NotFound';
import GuidedJournal from './tools/GuidedJournal';
import SlideStudio from './tools/SlideStudio';
import PendulumDetector from './tools/PendulumDetector';
import ImportanceMeter from './tools/ImportanceMeter';
import GoalsDoors from './tools/GoalsDoors';
import Awakening from './tools/Awakening';
import BraidFrame from './tools/BraidFrame';
import EnergyFlows from './tools/EnergyFlows';
import MatrixDetox from './tools/MatrixDetox';
import VisionBoard from './tools/VisionBoard';
import Wallpaper from './tools/Wallpaper';
import type { ToolId } from '../types';

function ToolBody({ id }: { id: ToolId }) {
  switch (id) {
    case 'slajdy':
      return <SlideStudio />;
    case 'wahadla':
      return <PendulumDetector />;
    case 'waznosc':
      return <ImportanceMeter />;
    case 'cele':
      return <GoalsDoors />;
    case 'przebudzenie':
      return <Awakening />;
    case 'warkocz':
      return <BraidFrame />;
    case 'energia':
      return <EnergyFlows />;
    case 'detoks':
      return <MatrixDetox />;
    case 'wizje':
      return <VisionBoard />;
    case 'tapeta':
      return <Wallpaper />;
    case 'poranek':
    case 'wieczor':
    case 'sny':
    case 'koordynacja':
    case 'frajling':
    case 'drogowskazy':
      return <GuidedJournal config={JOURNALS[id]!} />;
  }
}

export default function ToolPage() {
  const { tool: toolParam = '' } = useParams();
  const tool = TOOL_BY_ID[toolParam as ToolId];
  useTitle(tool?.title ?? 'Nie znaleziono');
  if (!tool) return <NotFound />;
  const lesson = tool.lesson ? LESSON_BY_SLUG[tool.lesson] : undefined;

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Okruszki">
        <Link to="/praktyka/">Praktyka</Link>
        <span aria-hidden>/</span>
        <span>{tool.title}</span>
      </nav>
      <PageHeader
        icon={tool.icon}
        title={tool.title}
        lead={tool.description}
        actions={
          lesson && (
            <Link to={`/wiedza/${lesson.slug}/`} className="btn btn-ghost btn-sm">
              <BookOpen size={16} aria-hidden /> Lekcja: {lesson.title}
            </Link>
          )
        }
      />
      <ToolBody key={tool.id} id={tool.id} />
    </div>
  );
}
