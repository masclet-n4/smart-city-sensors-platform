import { describe, expect, it } from 'vitest';
import {
  parseFormatA,
  parseFormatB,
  parsePayload,
} from './payload.parser';


describe('parseFormatA', () => {
  it('normalizes a valid format A payload', () => {
    expect(
      parseFormatA([
        {
          sensorCode: 'TEMP-001',
          ts: '2026-01-30T10:00:00Z',
          valueC: 21.4,
        },
      ]),
    ).toEqual([
      {
        sensorCode: 'TEMP-001',
        timestamp: new Date('2026-01-30T10:00:00Z'),
        valueC: 21.4,
      },
    ]);
  });

  it.each([
    null,
    [],
    [null],
    [{}],
    [{ sensorCode: '', ts: '2026-01-30T10:00:00Z', valueC: 21.4 }],
    [{ sensorCode: 'TEMP-001', ts: 'invalid', valueC: 21.4 }],
    [
      {
        sensorCode: 'TEMP-001',
        ts: '2026-01-30T10:00:00Z',
        valueC: Number.NaN,
      },
    ],
  ])('rejects an invalid payload', (payload) => {
    expect(() => parseFormatA(payload)).toThrow();
  });
});

describe('parseFormatB', () => {
  it('normalizes a valid format B payload', () => {
    expect(
      parseFormatB({
        deviceId: 'TEMP-001',
        data: [{ time: 1706600000, temp: 21.4 }],
      }),
    ).toEqual([
      {
        sensorCode: 'TEMP-001',
        timestamp: new Date(1706600000 * 1000),
        valueC: 21.4,
      },
    ]);
  });

  it.each([
    null,
    {},
    { deviceId: '', data: [{ time: 1706600000, temp: 21.4 }] },
    { deviceId: 'TEMP-001', data: [] },
    { deviceId: 'TEMP-001', data: [null] },
    { deviceId: 'TEMP-001', data: [{ time: 'invalid', temp: 21.4 }] },
    { deviceId: 'TEMP-001', data: [{ time: 1706600000, temp: Number.NaN }] },
  ])('rejects an invalid payload', (payload) => {
    expect(() => parseFormatB(payload)).toThrow();
  });
});

describe('parsePayload', () => {
  it('detects formats A and B', () => {
    expect(
      parsePayload([
        {
          sensorCode: 'TEMP-A',
          ts: '2026-01-30T10:00:00Z',
          valueC: 20,
        },
      ]),
    ).toEqual([
      {
        sensorCode: 'TEMP-A',
        timestamp: new Date('2026-01-30T10:00:00Z'),
        valueC: 20,
      },
    ]);

    expect(
      parsePayload({
        deviceId: 'TEMP-B',
        data: [{ time: 1706600000, temp: 22 }],
      }),
    ).toEqual([
      {
        sensorCode: 'TEMP-B',
        timestamp: new Date(1706600000 * 1000),
        valueC: 22,
      },
    ]);
  });

  it('rejects an unsupported payload format', () => {
    expect(() => parsePayload('invalid')).toThrow(
      'Unsupported temperature payload format',
    );
  });
});
