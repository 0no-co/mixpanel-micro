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
  token?: string; // TODO
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

let baseState: State | void;

export let baseToken: string | void;
export const registeredState: Partial<State> = {};

export function getBaseState(): State {
  if (!baseState) {
    const ua = navigator.userAgent || '';
    const uuid = makeUUID();
    const browser = getBrowser(ua);
    baseState = {
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
  return baseState;
}

export function hasState() {
  return baseToken != null;
}

export function initState(token: string) {
  getBaseState();
  baseToken = token;
}

export function register(data: Partial<State>) {
  for (const key in data) {
    registeredState[key] = data[key] || null;
  }
}
