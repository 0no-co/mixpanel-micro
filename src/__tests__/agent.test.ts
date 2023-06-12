import { vi, beforeEach, describe, it, expect } from 'vitest';

import {
  getDevice,
  getOS,
  getBrowser,
  getReferringDomain,
  getDoNotTrack,
} from '../agent';

describe('getDevice', () => {
  it('recognizes devices ', () => {
    expect(getDevice('iPad')).toBe('iPad');
    expect(getDevice('iPod')).toBe('iPod Touch');
    expect(getDevice('iPhone')).toBe('iPhone');
    expect(getDevice('Android')).toBe('Android');
    expect(getDevice('---')).toBe(null);
  });
});

describe('getOS', () => {
  it('recognizes operating systems ', () => {
    expect(getOS('Windows')).toBe('Windows');
    expect(getOS('iPad')).toBe('iOS');
    expect(getOS('iPod')).toBe('iOS');
    expect(getOS('iPhone')).toBe('iOS');
    expect(getOS('Android')).toBe('Android');
    expect(getOS('macOS')).toBe('Mac OS X');
    expect(getOS('Linux')).toBe('Linux');
    expect(getOS('CrOS')).toBe('Chrome OS');
    expect(getOS('---')).toBe(null);
  });
});

describe('getBrowser', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
  });

  it('recognizes browsers', () => {
    expect(getBrowser(' OPR/Mini')).toBe('Opera Mini');
    expect(getBrowser(' OPR/')).toBe('Opera');
    expect(getBrowser('Edge')).toBe('Microsoft Edge');
    expect(getBrowser('FBIOS')).toBe('Facebook Mobile');
    expect(getBrowser('Chrome')).toBe('Chrome');
    expect(getBrowser('SamsungBrowser/')).toBe('Samsung Internet');
    expect(getBrowser('UCWEB')).toBe('UC Browser');
    expect(getBrowser('UCBrowser')).toBe('UC Browser');
    expect(getBrowser('FxiOS')).toBe('Firefox iOS');
    expect(getBrowser('Safari')).toBe('Safari');
    expect(getBrowser('Safari Mobile')).toBe('Mobile Safari');
    expect(getBrowser('Android')).toBe('Android Mobile');
    expect(getBrowser('Konqueror')).toBe('Konqueror');
    expect(getBrowser('Firefox')).toBe('Firefox');
    expect(getBrowser('MSIE')).toBe('Internet Explorer');
    expect(getBrowser('Trident/')).toBe('Internet Explorer');
    expect(getBrowser('Gecko')).toBe('Mozilla');
    expect(getBrowser('---')).toBe(null);
  });
});

describe('getReferringDomain', () => {
  it('gets the current domain from document.referrer', () => {
    vi.stubGlobal('document', {
      referrer: 'https://google.com/test',
    });

    expect(getReferringDomain()).toBe('google.com');
  });

  it('falls back to null otherwise', () => {
    vi.stubGlobal('document', {
      referrer: 'blob:',
    });

    expect(getReferringDomain()).toBe(null);
  });
});

describe('getDoNotTrack', () => {
  it('gets the current doNotTrack value from navigator', () => {
    vi.stubGlobal('navigator', {
      doNotTrack: undefined,
    });

    expect(getDoNotTrack()).toBe(false);

    vi.stubGlobal('navigator', {
      doNotTrack: 1,
    });

    expect(getDoNotTrack()).toBe(true);

    vi.stubGlobal('navigator', {
      doNotTrack: 0,
    });

    expect(getDoNotTrack()).toBe(false);
  });
});
