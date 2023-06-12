import { makeUUID } from './uuid';

import {
  getDevice,
  getOS,
  getBrowser,
  getBrowserVersion,
  getReferringDomain,
  getDoNotTrack,
} from './agent';

export interface State {
  $os: string | null;
  $browser: string | null;
  $browser_version: number | null;
  $device: string | null;
  $screen_height: number;
  $screen_width: number;
  $referrer: string;
  $referring_domain: string | null;
  $device_id: string;
  $lib_version: '0.0.0';
  token: string;
  $anon_distinct_id?: string;
  distinct_id: string;
  mp_lib: string;
  doNotTrack?: boolean;
  time?: number;
  $current_url?: string;
  $user_id?: string;
  $insert_id?: string;
  [prop: string]: unknown;
}

let state: State;

export function init(token: string) {
  const ua = navigator.userAgent || '';
  const uuid = makeUUID();
  const browser = getBrowser(ua);
  state = {
    token,
    $os: getOS(ua),
    $browser: browser,
    $browser_version: getBrowserVersion(browser, ua),
    $device: getDevice(ua),
    $screen_height: screen.height,
    $screen_width: screen.width,
    $referrer: document.referrer,
    $referring_domain: getReferringDomain(),
    $current_url: window.location.href,
    distinct_id: uuid,
    $device_id: uuid,
    mp_lib: 'mixpanel-lite',
    $lib_version: '0.0.0',
    doNotTrack: getDoNotTrack(),
  };
}

export function hasState() {
  return !!state;
}

export function getState(): State | void {
  if (state) {
    state.$current_url = window.location.href;
    state.referrer = document.referrer;
    state.time = Math.round(Date.now() / 1000);
    return state;
  }
}

export function register(data: Partial<State>) {
  for (const key in data) {
    if (data[key]) {
      state[key] = data[key];
    } else {
      delete state[key];
    }
  }
}
