import { MockedFunction, vi, beforeEach, describe, it, expect } from 'vitest';

import { State, hasState } from '../state';
import { _assemblePayload, _flushPayload, _flushQueue, _queue } from '../send';

const TIME = 1686584284103;

let sendBeaconFn: MockedFunction<typeof navigator['sendBeacon']>;
let fetchFn: MockedFunction<typeof fetch>;

vi.mock('../state', () => ({
  hasState: vi.fn(() => true),
  getBaseState: vi.fn(() => ({ distinct_id: 'ID' })),
  baseToken: 'TOKEN',
}));

beforeEach(() => {
  sendBeaconFn = vi.fn((_url, _options) => true);
  fetchFn = vi.fn(async (_url, _options) => new Response());

  vi.useFakeTimers();
  vi.setSystemTime(TIME);
  vi.stubGlobal('fetch', fetchFn);
  vi.stubGlobal('navigator', {
    sendBeacon: sendBeaconFn,
    onLine: true,
  });
});

describe('_assemblePayload', () => {
  it('combines base state, data, and a token', () => {
    expect(_assemblePayload({} as any)).toEqual({
      event: undefined,
      properties: {
        distinct_id: 'ID',
        token: 'TOKEN',
      },
    });

    expect(
      _assemblePayload({
        event: 'EVENT_NAME',
        properties: {
          test: 'test',
        },
      } as any)
    ).toEqual({
      event: 'EVENT_NAME',
      properties: {
        distinct_id: 'ID',
        test: 'test',
        token: 'TOKEN',
      },
    });

    expect(
      _assemblePayload({
        $set: { test: 'test' },
      } as any)
    ).toEqual({
      $distinct_id: 'ID',
      $token: 'TOKEN',
      $set: {
        test: 'test',
      },
    });
  });
});

describe('_flushPayload', () => {
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
      '"https://api.mixpanel.com/track?ip=1&verbose=1&data=eyJldmVudCI6ImV2ZW50IiwicHJvcGVydGllcyI6eyJkaXN0aW5jdF9pZCI6IklEIiwidG9rZW4iOiJUT0tFTiJ9fQ%3D%3D&_=1686584284103"'
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
      '"https://api.mixpanel.com/track?ip=1&verbose=1&data=eyJldmVudCI6ImV2ZW50IiwicHJvcGVydGllcyI6eyJkaXN0aW5jdF9pZCI6IklEIiwidG9rZW4iOiJUT0tFTiJ9fQ%3D%3D&_=1686584284103"'
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
      '"https://api.mixpanel.com/engage?ip=1&verbose=1&data=eyIkc2V0Ijp7InRlc3QiOiJ0ZXN0In0sIiRkaXN0aW5jdF9pZCI6IklEIiwiJHRva2VuIjoiVE9LRU4ifQ%3D%3D&_=1686584284103"'
    );
  });
});

describe('_flushQueue', () => {
  it('calls _flushPayload per item in the queue', async () => {
    vi.mocked(hasState).mockReturnValue(true);

    await _flushQueue();
    expect(sendBeaconFn).toHaveBeenCalledTimes(0);

    _queue.push({
      event: 'event',
      properties: {} as State,
    });

    _queue.push({
      event: 'event',
      properties: {} as State,
    });

    await _flushQueue();
    expect(sendBeaconFn).toHaveBeenCalledTimes(2);
  });

  it('does nothing when `hasState` returns false', async () => {
    vi.mocked(hasState).mockReturnValue(false);

    _queue.push({
      event: 'event',
      properties: {} as State,
    });

    _queue.push({
      event: 'event',
      properties: {} as State,
    });

    await _flushQueue();
    expect(sendBeaconFn).toHaveBeenCalledTimes(0);
  });

  it('aborts when device is offline', async () => {
    vi.mocked(hasState).mockReturnValue(true);
    vi.stubGlobal('navigator', {
      sendBeacon: sendBeaconFn,
      onLine: false,
    });

    _queue.push({
      event: 'event',
      properties: {} as State,
    });

    await _flushQueue();
    expect(sendBeaconFn).toHaveBeenCalledTimes(0);
  });
});
