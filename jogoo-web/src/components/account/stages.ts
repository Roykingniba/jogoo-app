import type { JourneyEvent, Stage } from '../../data/backend';
import type { MsgKey } from '../../i18n/i18n';
import type { Tone } from '../../data/models';

export const stageKey = (s: Stage) => `stage_${s}` as MsgKey;
export const stageDescKey = (s: Stage) => `stageDesc_${s}` as MsgKey;

/** Pill colour per stage: early = blue, money = orange, done = lime. */
export const stageTone = (s: Stage): Tone =>
  s === 'installed' ? 'lime'
    : s === 'payment_made' || s === 'installation_scheduled' ? 'orange'
      : s === 'signed_up' ? 'pink'
        : s === 'quote_sent' ? 'cyan' : 'blue';

/** Latest event recorded for each stage (a stage can be set more than once). */
export function lastEventByStage(events: JourneyEvent[]) {
  const map = new Map<Stage, JourneyEvent>();
  for (const e of events) map.set(e.stage, e);
  return map;
}
