import { Kem } from '../src/identifiers';

export function hexStringToBytes(v: string): Uint8Array {
  const res = v.match(/[\da-f]{2}/gi);
  if (res == null) {
    throw new Error('Not hex string.');
  }
  return new Uint8Array(res.map(function (h) {
    return parseInt(h, 16);
  }));
}

export function bytesToBase64Url(v: Uint8Array): string {
  return btoa(String.fromCharCode(...v))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=*$/g, '');
}

export function kemToKeyGenAlgorithm(kem: Kem): EcKeyGenParams {
  switch (kem) {
    case Kem.DhkemP256HkdfSha256:
      return {
        name: 'ECDH',
        namedCurve: 'P-256',
      };
    case Kem.DhkemP384HkdfSha384:
      return {
        name: 'ECDH',
        namedCurve: 'P-384',
      };
    default:
      // case Kem.DhkemP521HkdfSha512:
      return {
        name: 'ECDH',
        namedCurve: 'P-521',
      };
  }
}
