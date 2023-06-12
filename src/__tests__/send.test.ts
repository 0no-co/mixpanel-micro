import { MockedFunction, vi, beforeEach, describe, it, expect } from 'vitest';

import type { State } from '../state';
import { _flushPayload } from '../send';

const TIME = 1686584284103;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TIME);
});

describe('_flushPayload', () => {
  let sendBeaconFn: MockedFunction<typeof navigator['sendBeacon']>;
  let fetchFn: MockedFunction<typeof fetch>;

  beforeEach(() => {
    sendBeaconFn = vi.fn((_url, _options) => true);
    fetchFn = vi.fn(async (_url, _options) => new Response());

    vi.stubGlobal('navigator', { sendBeacon: sendBeaconFn });
    vi.stubGlobal('fetch', fetchFn);
  });

  it('encodes data and sends a Beacon API request', async () => {
    const result$ = _flushPayload({
      event: 'event',
      properties: {} as State,
    });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(sendBeaconFn).toHaveBeenCalled();

    const url = sendBeaconFn.mock.calls[0][0] as string;
    expect(url).toMatch(new RegExp(`&_=${TIME}$`));

    expect(url).toMatchInlineSnapshot(
      '"https://api.mixpanel.com/track?ip=1&verbose=1&data=eyJldmVudCI6ImV2ZW50IiwicHJvcGVydGllcyI6e319&_=1686584284103"'
    );

    expect(await result$).toBe(true);
  });

  it('calls fetch when Beacon API returns false', async () => {
    sendBeaconFn.mockReturnValue(false);

    fetchFn
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValue(new Response(null, { status: 200 }));

    const result$ = _flushPayload({
      event: 'event',
      properties: {} as State,
    });

    expect(sendBeaconFn).toHaveBeenCalled();

    await vi.advanceTimersToNextTimerAsync();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersToNextTimerAsync();
    expect(fetchFn).toHaveBeenCalledTimes(2);

    const url = fetchFn.mock.calls[0][0] as string;
    expect(url).toMatch(new RegExp(`&_=${TIME}$`));

    expect(url).toMatchInlineSnapshot(
      '"https://api.mixpanel.com/track?ip=1&verbose=1&data=eyJldmVudCI6ImV2ZW50IiwicHJvcGVydGllcyI6e319&_=1686584284103"'
    );

    expect(await result$).toBe(true);
  });

  it('returns false when all calls fail', async () => {
    sendBeaconFn.mockReturnValue(false);
    fetchFn.mockResolvedValue(new Response(null, { status: 500 }));

    const result$ = _flushPayload({
      event: 'event',
      properties: {} as State,
    });

    await vi.runAllTimersAsync();
    expect(sendBeaconFn).toHaveBeenCalled();
    expect(fetchFn).toHaveBeenCalledTimes(3);

    expect(await result$).toBe(false);
  });

  it('uses the Engage API URL when appropriate', async () => {
    sendBeaconFn.mockReturnValue(true);

    _flushPayload({
      $set: { test: 'test' },
    } as any);

    expect(sendBeaconFn).toHaveBeenCalled();
    expect(sendBeaconFn.mock.calls[0][0]).toMatchInlineSnapshot(
      '"https://api.mixpanel.com/engage?ip=1&verbose=1&data=eyIkc2V0Ijp7InRlc3QiOiJ0ZXN0In19&_=1686584284103"'
    );
  });
});
