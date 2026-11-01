import type { Lesson, ModuleId } from '../../types';
import { plainText } from '../../lib/text';
import { podstawy } from './podstawy';
import { wahadla } from './wahadla';
import { rownowaga } from './rownowaga';
import { zamiar } from './zamiar';
import { dusza } from './dusza';
import { lustro } from './lustro';
import { tafti } from './tafti';
import { matrix } from './matrix';

export const LESSONS: Lesson[] = [
  ...podstawy,
  ...wahadla,
  ...rownowaga,
  ...zamiar,
  ...dusza,
  ...lustro,
  ...tafti,
  ...matrix,
];

export const LESSON_BY_SLUG: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.slug, l]));

export function lessonsOfModule(module: ModuleId): Lesson[] {
  return LESSONS.filter((l) => l.module === module);
}

export function lessonText(lesson: Lesson): string {
  const parts = [
    lesson.title,
    lesson.subtitle,
    lesson.summary,
    ...lesson.sections.flatMap((s) => [s.heading, ...(s.body ?? []), ...(s.bullets ?? [])]),
    lesson.practice.title,
    ...lesson.practice.steps,
    lesson.practice.tip ?? '',
    ...lesson.mistakes,
    ...lesson.questions,
  ];
  return plainText(parts.join(' '));
}

/** Szacowany czas czytania (ok. 180 słów na minutę). */
export function readingMinutes(lesson: Lesson): number {
  const words = lessonText(lesson).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}
