import { Address, BigInt } from '@graphprotocol/graph-ts';

export var ADDRESS_ZERO: Address = Address.fromHexString(
  '0x0000000000000000000000000000000000000000',
) as Address;

// TODO update this block number
export var FEE_UPDATE_BLOCK_NUMBER = BigInt.fromI32(0);
