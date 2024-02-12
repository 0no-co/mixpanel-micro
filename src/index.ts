import {
  initState,
  getBaseState,
  registeredState,
  register,
  State,
} from './state';
import { initSend, setBaseUrl, send } from './send';

export type { State } from './state';
export { register } from './state';
export { mute, unmute } from './send';

const rand16 = () => Math.random().toString(36).slice(2, 10);
/**
 * If you need a different base URL rather than https://api.mixpanel.com, pass it as the second argument to `init`.
 * (e.g. when using a proxy to track events)
 */
export function init(token: string, baseUrl?: string) {
  initState(token);
  if (baseUrl) {
    setBaseUrl(baseUrl);
  }
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
