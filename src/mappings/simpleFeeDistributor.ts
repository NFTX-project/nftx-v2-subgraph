import {
  AddFeeReceiver as AddFeeReceiverEvent,
  UpdateFeeReceiverAlloc as UpdateFeeReceiverAllocEvent,
  UpdateFeeReceiverAddress as UpdateFeeReceiverAddressEvent,
  RemoveFeeReceiver as RemoveFeeReceiverEvent,
  UpdateTreasuryAddress as UpdateTreasuryAddressEvent,
  UpdateLPStakingAddress as UpdateLPStakingAddressEvent,
} from '../types/NFTXSimpleFeeDistributor/NFTXSimpleFeeDistributor';
import { getGlobal, getSimpleFeeReceiver } from './helpers';
import { store } from '@graphprotocol/graph-ts';
import { UpdateNFTXVaultFactory } from '../types/NFTXVaultFactoryUpgradeable/NFTXFeeDistributor';

export function handleAddFeeReceiver(event: AddFeeReceiverEvent): void {
  let feeReceiverAddress = event.params.receiver;

  let feeReceiver = getSimpleFeeReceiver(feeReceiverAddress);

  feeReceiver.allocPoint = event.params.allocPoint;
  feeReceiver.save();
}

export function handleUpdateFeeReceiverAlloc(
  event: UpdateFeeReceiverAllocEvent,
): void {
  let feeReceiverAddress = event.params.receiver;

  let feeReceiver = getSimpleFeeReceiver(feeReceiverAddress);
  feeReceiver.allocPoint = event.params.allocPoint;

  feeReceiver.save();
}

export function handleUpdateFeeReceiverAddress(
  event: UpdateFeeReceiverAddressEvent,
): void {
  let newFeeReceiverAddress = event.params.newReceiver;
  let oldFeeReceiverAddress = event.params.oldReceiver;

  let oldFeeReceiver = getSimpleFeeReceiver(oldFeeReceiverAddress);
  let newFeeReceiver = getSimpleFeeReceiver(newFeeReceiverAddress);

  newFeeReceiver.allocPoint = oldFeeReceiver.allocPoint;
  newFeeReceiver.save();

  store.remove('FeeReceiver', oldFeeReceiver.id);
}

export function handleRemoveFeeReceiver(event: RemoveFeeReceiverEvent): void {
  let feeReceiverAddress = event.params.receiver;
  let feeReceiver = getSimpleFeeReceiver(feeReceiverAddress);
  store.remove('FeeReceiver', feeReceiver.id);
}

export function handleUpdateTreasuryAddress(
  event: UpdateTreasuryAddressEvent,
): void {
  let global = getGlobal();
  global.treasuryAddress = event.params.newTreasury;
  global.save();
}

export function handleUpdateLPStakingAddress(
  event: UpdateLPStakingAddressEvent,
): void {
  let global = getGlobal();
  global.lpStakingAddress = event.params.newLPStaking;
  global.save();
}

export function handleUpdateNFTXVaultFactory(
  event: UpdateNFTXVaultFactory,
): void {
  let global = getGlobal();
  global.nftxVaultFactory = event.params.factory;
  global.save();
}