<div align="center">
  <h2>@0no-co/mixpanel-micro</h2>
  <strong>Tiny implementation of the Mixpanel browser API</strong>
  <br />
  <br />
  <a href="https://npmjs.com/package/@0no-co/mixpanel-micro">
    <img alt="Bundlesize" src="https://deno.bundlejs.com/?q=@0no-co/mixpanel-micro&badge" />
  </a>
  <br />
  <br />
</div>

`@0no-co/mixpanel-micro` is a Mixpanel utility library, based on
[mixpanel-lite](https://github.com/john-doherty/mixpanel-lite), which targets
modern browsers and makes use of the Beacon API if it's available.

It provides ESM exports of the Mixpanel Browser API and unlike `mixpanel-lite`
it:

- Makes use of the [Beacon
  API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) if it's
  available
- Falls back on the [Fetch
  API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with
  `keepalive: true` set if the Beacon API is unavailable
- Respects `navigator.onLine` and the `online` event, which are heuristics but
  have wide cross-browser support
- Uses the `visibilitychange` event to send events before a tab closes
- **Does not** implement offline storage for the event queue, and instead uses
  a best effort approach to sending events
