import { init as initState, getState, register, State } from './state';
import { init as initSend, send } from './send';

const rand16 = () => Math.random().toString(36).slice(2, 10);

export type { State } from './state';
export { register } from './state';

export function init(token: string) {
  initState(token);
  initSend();
}

export function getProperty<Key extends keyof State>(key: Key): State[Key] {
  return (getState()! || {})[key];
}

export function track(eventName: string, data: Partial<State>) {
  const id = rand16() + rand16();
  send({
    event: eventName,
    properties: {
      ...getState()!,
      ...data,
      $insert_id: id,
    },
  });
}

export function identify(id: string) {
  const prevDistinctId = getProperty('distinct_id');

  register({
    distinct_id: id,
    $user_id: id,
  });

  track('$identify', {
    $anon_distinct_id: prevDistinctId,
    distinct_id: id,
    $user_id: id,
  });
}

export function setPeople(data: Record<string, unknown>) {
  send({
    $token: getProperty('token'),
    $distinct_id: getProperty('distinct_id'),
    $set: data,
  });
}
