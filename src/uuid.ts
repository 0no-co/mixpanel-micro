/** Generates a new distinct_id (code lifted from Mixpanel js) */
export function makeUUID(): string {
  // Time/ticks information
  function T() {
    let d = Date.now();
    let i = 0;
    while (d === Date.now()) i++;
    return d.toString(16) + i.toString(16);
  }

  // Random entropy
  function R() {
    return Math.random().toString(16).replace('.', '');
  }

  // User agent entropy
  // This function takes the user agent string, and then xors
  // together each sequence of 8 bytes. This produces a final
  // sequence of 8 bytes which it returns as hex.
  function UA() {
    const ua = navigator.userAgent;
    const buffer: number[] = [];

    function xor(result: number, byte_array: number[]) {
      let tmp = 0;
      for (let i = 0; i < byte_array.length; i++) tmp |= buffer[i] << (i * 8);
      return result ^ tmp;
    }

    let ch: number;
    let ret = 0;
    for (let i = 0; i < ua.length; i++) {
      ch = ua.charCodeAt(i);
      buffer.unshift(ch & 0xff);
      if (buffer.length >= 4) {
        ret = xor(ret, buffer);
        buffer.length = 0;
      }
    }

    if (buffer.length > 0) {
      ret = xor(ret, buffer);
    }

    return ret.toString(16);
  }

  const se = (screen.height * screen.width).toString(16);
  return `${T()}-${R()}-${UA()}-${se}-${T()}`;
}
