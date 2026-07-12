import { fetch, Headers, Request, Response } from 'cross-fetch';
import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import { BroadcastChannel } from 'node:worker_threads';

Object.assign(globalThis, {
  fetch,
  Headers,
  BroadcastChannel,
  Request,
  Response,
  ReadableStream,
  TextDecoder,
  TextEncoder,
  TransformStream,
  WritableStream,
});
