import {
  AddFeeReceiver as AddFeeReceiverEvent,
  UpdateFeeReceiverAlloc as UpdateFeeReceiverAllocEvent,
  UpdateFeeReceiverAddress as UpdateFeeReceiverAddressEvent,
  RemoveFeeReceiver as RemoveFeeReceiverEvent,
  UpdateTreasuryAddress as UpdateTreasuryAddressEvent,
  UpdateDefaultTreasuryAlloc as UpdateDefaultTreasuryAllocEvent,
  UpdateSpecificTreasuryAlloc as UpdateSpecificTreasuryAllocEvent,
  UpdateLPStakingAddress as UpdateLPStakingAddressEvent,
  UpdateDefaultLPAlloc as UpdateDefaultLPAllocEvent,
  NFTXFeeDistributor,
} from '../types/templates/NFTXFeeDistributor/NFTXFeeDistributor';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/templates/NFTXFeeDistributor/NFTXVaultFactoryUpgradeable';
import { getGlobal, getFeeReceiver, getVault } from './helpers';
import { BigInt, store, Address } from '@graphprotocol/graph-ts';
import { ADDRESS_ZERO } from './constants';
import { Vault } from '../types/schema';

function updateAlloc(
  vaultId: BigInt,
  vault: Vault,
  feeDistributorInstance: NFTXFeeDistributor,
): Vault {
  let allocTotalFromInstance = feeDistributorInstance.try_allocTotal(vaultId);
  let allocTotal = allocTotalFromInstance.reverted
    ? BigInt.fromI32(0)
    : allocTotalFromInstance.value;

  let specificTreasuryAllocFromInstance =
    feeDistributorInstance.try_specificTreasuryAlloc(vaultId);
  let specificTreasuryAlloc = specificTreasuryAllocFromInstance.reverted
    ? BigInt.fromI32(0)
    : specificTreasuryAllocFromInstance.value;

  let defaultTreasuryAllocFromInstance =
    feeDistributorInstance.try_defaultTreasuryAlloc();
  let defaultTreasuryAlloc = defaultTreasuryAllocFromInstance.reverted
    ? BigInt.fromI32(0)
    : defaultTreasuryAllocFromInstance.value;

  vault.allocTotal = allocTotal;
  let treasuryAlloc = specificTreasuryAlloc;
  if (treasuryAlloc == BigInt.fromI32(0)) {
    treasuryAlloc = defaultTreasuryAlloc;
  }
  vault.treasuryAlloc = treasuryAlloc;

  return vault;
}

function getVaultAddress(
  vaultId: BigInt,
  feeDistributorInstance: NFTXFeeDistributor,
): Address {
  let vaultFactoryAddressFromInstance =
    feeDistributorInstance.try_nftxVaultFactory();
  let vaultFactoryAddress = vaultFactoryAddressFromInstance.reverted
    ? ADDRESS_ZERO
    : vaultFactoryAddressFromInstance.value;

  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddressFromInstance = vaultFactoryInstance.try_vault(vaultId);
  let vaultAddress = vaultAddressFromInstance.reverted
    ? ADDRESS_ZERO
    : vaultAddressFromInstance.value;

  return vaultAddress;
}

export function handleAddFeeReceiver(event: AddFeeReceiverEvent): void {
  let feeReceiverAddress = event.params.receiver;
  let vaultId = event.params.vaultId;

  let feeReceiver = getFeeReceiver(vaultId, feeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);

  let vaultAddress = getVaultAddress(vaultId, feeDistributorInstance);

  let vault = getVault(vaultAddress);

  feeReceiver.vault = vault.id;
  feeReceiver.allocPoint = event.params.allocPoint;

  feeReceiver.save();

  vault = updateAlloc(vaultId, vault, feeDistributorInstance);

  vault.save();
}

export function handleUpdateFeeReceiverAlloc(
  event: UpdateFeeReceiverAllocEvent,
): void {
  let feeReceiverAddress = event.params.receiver;
  let vaultId = event.params.vaultId;

  let feeReceiver = getFeeReceiver(vaultId, feeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);

  let vaultAddress = getVaultAddress(vaultId, feeDistributorInstance);

  let vault = getVault(vaultAddress);

  feeReceiver.vault = vault.id;
  feeReceiver.allocPoint = event.params.allocPoint;

  feeReceiver.save();

  vault = updateAlloc(vaultId, vault, feeDistributorInstance);

  vault.save();
}

export function handleUpdateFeeReceiverAddress(
  event: UpdateFeeReceiverAddressEvent,
): void {
  let newFeeReceiverAddress = event.params.newReceiver;
  let oldFeeReceiverAddress = event.params.oldReceiver;
  let vaultId = event.params.vaultId;

  let oldFeeReceiver = getFeeReceiver(vaultId, oldFeeReceiverAddress);
  let newFeeReceiver = getFeeReceiver(vaultId, newFeeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);
  let vaultAddress = getVaultAddress(vaultId, feeDistributorInstance);

  let vault = getVault(vaultAddress);

  newFeeReceiver.vault = vault.id;
  newFeeReceiver.allocPoint = oldFeeReceiver.allocPoint;

  newFeeReceiver.save();
  store.remove('FeeReceiver', oldFeeReceiver.id);

  vault = updateAlloc(vaultId, vault, feeDistributorInstance);

  vault.save();
}

export function handleRemoveFeeReceiver(event: RemoveFeeReceiverEvent): void {
  let feeReceiverAddress = event.params.receiver;
  let vaultId = event.params.vaultId;

  let feeReceiver = getFeeReceiver(vaultId, feeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);

  let vaultAddress = getVaultAddress(vaultId, feeDistributorInstance);

  let vault = getVault(vaultAddress);

  store.remove('FeeReceiver', feeReceiver.id);

  vault = updateAlloc(vaultId, vault, feeDistributorInstance);

  vault.save();
}

export function handleUpdateTreasuryAddress(
  event: UpdateTreasuryAddressEvent,
): void {
  let global = getGlobal();
  global.treasuryAddress = event.params.newTreasury;
  global.save();
}

export function handleUpdateDefaultTreasuryAlloc(
  event: UpdateDefaultTreasuryAllocEvent,
): void {
  let global = getGlobal();
  global.defaultTreasuryAlloc = event.params.newTreasuryAlloc;
  global.save();
}

export function handleUpdateSpecificTreasuryAlloc(
  event: UpdateSpecificTreasuryAllocEvent,
): void {
  let vaultId = event.params.vaultId;
  let specificTreasuryAlloc = event.params.newSpecificAlloc;

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);

  let vaultAddress = getVaultAddress(vaultId, feeDistributorInstance);

  let vault = getVault(vaultAddress);

  let defaultTreasuryAllocFromInstance =
    feeDistributorInstance.try_defaultTreasuryAlloc();
  let defaultTreasuryAlloc = defaultTreasuryAllocFromInstance.reverted
    ? BigInt.fromI32(0)
    : defaultTreasuryAllocFromInstance.value;

  let treasuryAlloc = specificTreasuryAlloc;
  if (treasuryAlloc == BigInt.fromI32(0)) {
    treasuryAlloc = defaultTreasuryAlloc;
  }
  vault.treasuryAlloc = treasuryAlloc;
  vault.save();
}

export function handleUpdateLPStakingAddress(
  event: UpdateLPStakingAddressEvent,
): void {
  let global = getGlobal();
  global.lpStakingAddress = event.params.newLPStaking;
  global.save();
}

export function handleUpdateDefaultLPAlloc(
  event: UpdateDefaultLPAllocEvent,
): void {
  let global = getGlobal();
  global.defaultLpAlloc = event.params.newLPAlloc;
  global.save();
}
