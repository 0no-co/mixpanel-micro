import {
  initState,
  getBaseState,
  registeredState,
  register,
  State,
} from './state';
import { initSend, send } from './send';

export type { State } from './state';
export { register } from './state';
export { mute, unmute } from './send';

const rand16 = () => Math.random().toString(36).slice(2, 10);

export function init(token: string) {
  initState(token);
  return initSend();
}

export function getProperty<Key extends keyof State>(key: Key): State[Key] {
  return registeredState[key] ? registeredState[key] : getBaseState()[key];
}

export function track(eventName: string, data?: Partial<State>) {
  const properties: Partial<State> = {};
  if (data) {
    for (const key in data) {
      properties[key] = data[key] || properties[key] || null;
    }
  }
  properties.$insert_id = rand16() + rand16();
  send({ event: eventName, properties });
}

export function identify(id: string) {
  const prevDistinctId = getBaseState().distinct_id;
  register({
    $anon_distinct_id: prevDistinctId,
    distinct_id: id,
    $user_id: id,
  });
  track('$identify');
}

export function setPeople(data: Record<string, unknown>) {
  send({ $set: data });
}
