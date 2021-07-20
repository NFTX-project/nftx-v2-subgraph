import {
  Bytes
} from '@graphprotocol/graph-ts';
import {
  Zap
} from '../types/schema';

export function getZap(txHash: Bytes): Zap {
  let zap = Zap.load(txHash.toHexString());
  if (zap == null) {
    zap = new Zap(txHash.toHexString());
  }
  return zap as Zap;
}