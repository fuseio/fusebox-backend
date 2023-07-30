import { BytesLike } from "ethers";
import assert from 'assert';
import { Fragment, Interface } from '@ethersproject/abi'
import { TransactionFactory, TypedTransaction } from '@ethereumjs/tx'
import { toBuffer } from 'ethereumjs-util'
import { parseAbi } from './parseAbi'
import { hexSchema } from './validation/schemas/hexSchema'
export type HexSigType = 'signatures' | 'event-signatures';

interface FourBytesReponseEntry {
  id: number;
  text_signature: string;
  bytes_signature: string;
  created_at: string;
  hex_signature: string;
}


export class UserOpParser {

  async parseCallData(callData: string) {
    // const txDataBuffer = toBuffer(callData);
    let response = await decodeWithCalldata(sigHashFromCalldata(callData), callData)
    const walletMethod = response[0]
    const walletCallData = walletMethod.decoded[2] as string
    response = await decodeWithCalldata(sigHashFromCalldata(walletCallData), walletCallData)
    const targetMethod = response[0]
    return {walletMethod, targetMethod}
  }
}

export function sigHashFromCalldata(calldata: string): string | undefined {
  const chunk = calldata.slice(0, 10);
  if (hexSchema.safeParse(chunk).success) {
    return chunk;
  }
}

export async function decodeWithCalldata(
  sigHash: string,
  calldata: string,
): Promise<DecodeResult[] | undefined> {
  const response = await fetch4BytesBy.Signatures(sigHash);
  if (response) {
    const ifaces = parse4BytesResToIfaces(response);
    const decodedByCalldata = decodeByCalldata(ifaces, calldata);
    if (decodedByCalldata.length === 0 && ifaces.length > 0) {
      return [{ decoded: [], fragment: ifaces[0].fragments[0], sigHash }];
    } else {
      return decodedByCalldata;
    }
  }
}


// @internal
export function decodeByCalldata(
  ifaces: Interface[],
  calldata: string,
): DecodeResult[] {
  return decode4BytesData(ifaces, calldata, decodeCalldata);
}

export function decodeCalldata(
  iface: Interface,
  calldata: string,
): DecodeResult | undefined {
  const abi = iface.fragments;

  let decoded: ReadonlyArray<unknown> | undefined;
  let fragment: Fragment | undefined;

  for (const frag of abi) {
    try {
      decoded = iface.decodeFunctionData(frag.name, calldata);
      const encoded = iface.encodeFunctionData(frag.name, decoded);
      assert(
        encoded === calldata,
        'Ignore functions that do not fully encode data',
      );
      fragment = frag;
    } catch (e) {
      // catch error here to avoid error throw,
      // as we want to check which fragment decodes successfully and save it
    }
  }

  if (decoded && fragment) {
    return { decoded, fragment, sigHash: iface.getSighash(fragment) };
  }
}


export function decode4BytesData<T extends unknown, R>(
  ifaces: Interface[],
  data: T,
  decodeFn: (iface: Interface, data: T) => R | undefined,
): R[] {
  const decoded: R[] = [];
  for (const iface of ifaces) {
    const decodeResult = decodeFn(iface, data);
    if (decodeResult) decoded.push(decodeResult);
  }
  return decoded;
}

function parse4BytesResToIfaces(
  data: FourBytesReponseEntry[],
  defaultKeyword: string = 'function',
): Interface[] {
  const ifaces: Interface[] = [];
  for (const result of data) {
    const frag = result.text_signature;
    let parsed: Interface | Error;
    try {
      parsed = parseAbi(frag, defaultKeyword);
      if (parsed instanceof Interface) ifaces.push(parsed);
    } catch (e) {}
  }
  return ifaces;
}

const MAX_RETRY = 30;

export const fetch4BytesBy = {
  EventSignatures: async (sigHash: string) => {
    return fetch4Bytes(sigHash, 'event-signatures');
  },
  Signatures: async (sigHash: string) => {
    return fetch4Bytes(sigHash, 'signatures');
  },
};


type Bytes4Cache = {
  [sigType in HexSigType]: {
    // undefined - not populated
    // [] - no results
    // [...] - results
    [sig: string]: FourBytesReponseEntry[] | undefined;
  };
};

// @internal
const bytes4Cache: Bytes4Cache = {
  signatures: {},
  'event-signatures': {},
};

interface FourBytesResponse {
  count: number;
  next: unknown;
  previous: unknown;
  results: FourBytesReponseEntry[];
}

async function fetch4Bytes(
  hexSig: string,
  hexSigType: HexSigType,
  retries: number = 0,
): Promise<FourBytesReponseEntry[] | undefined> {
  let result: FourBytesReponseEntry[] | undefined;
  const cached = bytes4Cache[hexSigType][hexSig];
  if (cached) {
    return cached;
  }
  try {
    const results = (
      await safeFetch<FourBytesResponse>(`${urlTo(hexSigType)}${hexSig}`)
    ).results.reverse();
    bytes4Cache[hexSigType][hexSig] = results;
    result = results;
  } catch (error) {
    retries += 1;
    if (retries < MAX_RETRY) {
      return fetch4Bytes(hexSig, hexSigType, retries);
    } else {
      return undefined;
    }
  }
  return result;
}

function urlTo(hexSigType: HexSigType): string {
  return `https://www.4byte.directory/api/v1/${hexSigType}/?hex_signature=`;
}

async function safeFetch<T>(...args: Parameters<typeof fetch>): Promise<T> {
  return fetch(...args).then(async (response) => {
    if (response.status === 200) {
      return response.json() as unknown as T;
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  });
}



export interface Decoded extends ReadonlyArray<unknown> {}

export interface DecodeResult {
  decoded: Decoded;
  fragment: Fragment;
  sigHash: string;
}