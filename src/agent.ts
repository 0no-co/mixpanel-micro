export type Device = 'iPad' | 'iPod Touch' | 'iPhone' | 'Android' | null;

export function getDevice(ua: string): Device {
  if (/iPad/.test(ua)) {
    return 'iPad';
  } else if (/iPod/.test(ua)) {
    return 'iPod Touch';
  } else if (/iPhone/.test(ua)) {
    return 'iPhone';
  } else if (/Android/.test(ua)) {
    return 'Android';
  } else {
    return null;
  }
}

export type OS =
  | 'Windows'
  | 'iOS'
  | 'Android'
  | 'Mac OS X'
  | 'Linux'
  | 'Chrome OS'
  | null;

export function getOS(ua: string): OS | null {
  if (/Windows/i.test(ua)) {
    return 'Windows';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    return 'iOS';
  } else if (/Android/.test(ua)) {
    return 'Android';
  } else if (/Mac/i.test(ua)) {
    return 'Mac OS X';
  } else if (/Linux/.test(ua)) {
    return 'Linux';
  } else if (/CrOS/.test(ua)) {
    return 'Chrome OS';
  } else {
    return null;
  }
}

export type BrowserVersion =
  | 'Opera Mini'
  | 'Opera'
  | 'Microsoft Edge'
  | 'Facebook Mobile'
  | 'Samsung Internet'
  | 'Chrome'
  | 'Chrome iOS'
  | 'UC Browser'
  | 'Firefox iOS'
  | 'Mobile Safari'
  | 'Safari'
  | 'Android Mobile'
  | 'Firefox'
  | 'Internet Explorer'
  | 'Mozilla'
  | 'Konqueror'
  | null;

/**
 * This function detects which browser is running this script.
 * The order of the checks are important since many user agents
 * include key words used in later checks.
 */
export function getBrowser(ua: string): BrowserVersion {
  if ('opera' in window || / OPR\//.test(ua)) {
    return /Mini/.test(ua) ? 'Opera Mini' : 'Opera';
  } else if (/Edge/.test(ua)) {
    return 'Microsoft Edge';
  } else if (/FBIOS/.test(ua)) {
    return 'Facebook Mobile';
  } else if (/Chrome/.test(ua)) {
    return 'Chrome';
  } else if (/SamsungBrowser\//.test(ua)) {
    return 'Samsung Internet';
  } else if (/CriOS/.test(ua)) {
    return 'Chrome iOS';
  } else if (/UC(?:WEB|Browser)/.test(ua)) {
    return 'UC Browser';
  } else if (/FxiOS/.test(ua)) {
    return 'Firefox iOS';
  } else if (/Safari/.test(ua)) {
    return /Mobile/.test(ua) ? 'Mobile Safari' : 'Safari';
  } else if (/Android/.test(ua)) {
    return 'Android Mobile';
  } else if (/Konqueror/.test(ua)) {
    return 'Konqueror';
  } else if (/Firefox/.test(ua)) {
    return 'Firefox';
  } else if (/MSIE|Trident\//.test(ua)) {
    return 'Internet Explorer';
  } else if (/Gecko/.test(ua)) {
    return 'Mozilla';
  } else {
    return null;
  }
}

export function getBrowserVersion(
  browser: BrowserVersion,
  ua: string
): number | null {
  let matches: RegExpMatchArray | null = null;
  if (browser === 'Konqueror') {
    matches = ua.match(/Konqueror:(\d+(\.\d+)?)/);
  } else if (browser === 'Android Mobile') {
    matches = ua.match(/android\s(\d+(\.\d+)?)/);
  } else if (browser === 'Internet Explorer') {
    matches = ua.match(/(rv:|MSIE )(\d+(\.\d+)?)/);
  } else if (browser === 'Mozilla') {
    matches = ua.match(/rv:(\d+(\.\d+)?)/);
  } else {
    matches = ua.match(
      /(?:SamsungBrowser|Edge|Chrome|FxiOS|CriOS|UCBrowser|UCWEB|Version|Opera|OPR|Firefox|FxiOS)\/(\d+(\.\d+)?)/
    );
  }
  const version = matches && parseFloat(matches[matches.length - 2]);
  return version || null;
}

export function getReferringDomain(): string | null {
  const split = (document.referrer || '').split('/');
  return split.length >= 3 ? split[2] : null;
}

export function getDoNotTrack(): boolean {
  return `${navigator.doNotTrack}` === '1';
}
