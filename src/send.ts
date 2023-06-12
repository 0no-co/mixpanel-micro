import { State } from './state';

const TRACKING_URL = 'https://api.mixpanel.com/track?ip=1&verbose=1&data=';
const ENGAGE_URL = 'https://api.mixpanel.com/engage?ip=1&verbose=1&data=';
const ATTEMPTS = 3;

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
  properties: State;
}

export interface EngagePayload {
  $token: string;
  $distinct_id: string;
  $set: Record<string, unknown>;
}

export type Payload = EventPayload | EngagePayload;

const queue: Payload[] = [];
let task = false;
let muted = false;

async function flushPayload(data: Payload) {
  let url = '$set' in data ? ENGAGE_URL : TRACKING_URL;
  const serialized = base64(JSON.stringify(data, replacer));
  const timestamp = Date.now();

  url += `${encodeURIComponent(serialized)}&_=${timestamp}`;

  if (!navigator.sendBeacon(url)) {
    let response: Response | void;
    for (let attempt = 0; attempt < ATTEMPTS && isOnline(); attempt++) {
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

      await randomDelay();
    }

    return false;
  }

  return true;
}

async function flushQueue() {
  let payload: Payload | void;
  while ((payload = queue.shift()) && isOnline())
    if (!(await flushPayload(payload))) queue.unshift(payload);
  task = false;

  if (queue.length) {
    setTimeout(send, 5000);
  }
}

export function init() {
  function onOnline() {
    if (!task) {
      task = true;
      flushQueue();
    }
  }

  function onVisibilityChange(_event: Event) {
    if (!task && document.visibilityState === 'hidden') {
      task = true;
      flushQueue();
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
  if (muted) return;

  if (payload) queue.push(payload);

  if (!task && isOnline()) {
    task = true;
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(flushQueue);
    } else {
      setTimeout(flushQueue, 200);
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
