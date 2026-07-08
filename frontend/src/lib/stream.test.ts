import { describe, expect, it } from 'vitest';
import { ndjsonEvents } from './stream';

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<unknown[]> {
  const events: unknown[] = [];
  for await (const event of ndjsonEvents(stream)) events.push(event);
  return events;
}

describe('ndjsonEvents', () => {
  it('parses one event per line even when chunks split mid-JSON', async () => {
    const events = await collect(streamOf(['{"type":"sta', 'rt"}\n{"type":"done"}\n']));
    expect(events).toEqual([{ type: 'start' }, { type: 'done' }]);
  });

  it('yields a trailing event that has no final newline', async () => {
    const events = await collect(streamOf(['{"a":1}\n{"b":2}']));
    expect(events).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('skips blank lines between events', async () => {
    const events = await collect(streamOf(['{"a":1}\n\n\n{"b":2}\n']));
    expect(events).toEqual([{ a: 1 }, { b: 2 }]);
  });
});
