import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost'
});

// @ts-ignore - test environment helpers
globalThis.window = dom.window as any;
globalThis.document = dom.window.document as any;
globalThis.navigator = dom.window.navigator as any;
// @ts-ignore
globalThis.localStorage = dom.window.localStorage as any;

export {};
