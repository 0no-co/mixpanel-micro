import {
  hasState,
  baseToken,
  getBaseState,
  registeredState,
  State,
} from './state';

const ATTEMPTS = 3;

let trackingUrl = 'https://api.mixpanel.com/track';
let engageUrl = 'https://api.mixpanel.com/engage';

export function setBaseUrl(url: string) {
  trackingUrl = url + '/track';
  engageUrl = url + '/engage';
}

function base64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

function randomDelay(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 500 + 1000 * Math.random());
  });
}

function isOnline() {
  return navigator.onLine !== false;
}

function replacer(_key: string, value: unknown) {
  return value == null || value === '' ? undefined : value;
}

export interface EventPayload {
  event: string;
  properties: Partial<State>;
}

export interface EngagePayload {
  $token?: string;
  $distinct_id?: string;
  $set: Record<string, unknown>;
}

export type Payload = EventPayload | EngagePayload;

export const _queue: Payload[] = [];
let task = false;
let muted = false;

export const _assemblePayload = (data: Payload): Payload => {
  if ('$set' in data) {
    return {
      ...data,
      $distinct_id: getBaseState().distinct_id,
      $token: baseToken || undefined,
    };
  }

  const properties = { ...getBaseState() };

  for (const key in registeredState)
    if (registeredState[key] != null) properties[key] = registeredState[key];

  for (const key in data.properties)
    if (data.properties[key] != null) properties[key] = data.properties[key];

  properties.token = baseToken || undefined;

  return {
    event: data.event,
    properties,
  };
};

export async function _flushPayload(data: Payload) {
  const baseUrl = '$set' in data ? engageUrl : trackingUrl;
  const payload: Payload = _assemblePayload(data);
  const serialized = base64(JSON.stringify(payload, replacer));
  const timestamp = Date.now();
  const url =
    baseUrl +
    `?ip=1&verbose=1&data=${encodeURIComponent(serialized)}&_=${timestamp}`;

  if (!navigator.sendBeacon(url)) {
    let response: Response | void;
    for (let attempt = 0; attempt < ATTEMPTS && isOnline(); attempt++) {
      await randomDelay();

      try {
        response = await fetch(url, {
          method: 'POST',
          keepalive: true,
        });

        if (response.status < 500) {
          return true;
        }
      } catch (_error: any) {
        response = undefined;
      }
    }

    return false;
  }

  return true;
}

export async function _flushQueue() {
  if (hasState()) {
    let payload: Payload | void;
    while ((payload = _queue.shift()) && isOnline())
      if (!(await _flushPayload(payload))) _queue.unshift(payload);
    task = false;

    if (_queue.length) {
      setTimeout(send, 5000);
    }
  }
}

export function initSend() {
  function onOnline() {
    if (!task) {
      task = true;
      _flushQueue();
    }
  }

  function onVisibilityChange(_event: Event) {
    if (!task && document.visibilityState === 'hidden') {
      task = true;
      _flushQueue();
    }
  }

  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    onOnline();
    window.removeEventListener('online', onOnline);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export function send(payload?: Payload) {
  if (!muted) {
    if (payload) _queue.push(payload);

    if (!task && isOnline()) {
      task = true;
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(_flushQueue);
      } else {
        setTimeout(_flushQueue, 200);
      }
    }
  }
}

export function mute() {
  muted = true;
  task = true;
}

export function unmute() {
  muted = false;
  task = false;
  send();
}
