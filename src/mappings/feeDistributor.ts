import {
  AddFeeReceiver as AddFeeReceiverEvent,
  FeeReceiverAllocChange as FeeReceiverAllocChangeEvent,
  RemoveFeeReceiver as RemoveFeeReceiverEvent,
  NFTXFeeDistributor,
} from '../types/templates/NFTXFeeDistributor/NFTXFeeDistributor';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/templates/NFTXFeeDistributor/NFTXVaultFactoryUpgradeable';
import { getFeeReceiver, getVault } from './helpers';
import { BigInt, store, Address } from '@graphprotocol/graph-ts';
import {ADDRESS_ZERO} from './constants';
import {Vault} from '../types/schema';

function updateAlloc(vaultId: BigInt, vault: Vault, feeDistributorInstance: NFTXFeeDistributor): Vault {
  let allocTotalFromInstance = feeDistributorInstance.try_allocTotal(vaultId);
  let allocTotal = allocTotalFromInstance.reverted ? BigInt.fromI32(0) : allocTotalFromInstance.value;

  let specificTreasuryAllocFromInstance = feeDistributorInstance.try_specificTreasuryAlloc(vaultId);
  let specificTreasuryAlloc = specificTreasuryAllocFromInstance.reverted ? BigInt.fromI32(0) : specificTreasuryAllocFromInstance.value;

  let defaultTreasuryAllocFromInstance = feeDistributorInstance.try_defaultTreasuryAlloc();
  let defaultTreasuryAlloc = defaultTreasuryAllocFromInstance.reverted ? BigInt.fromI32(0) : defaultTreasuryAllocFromInstance.value;

  vault.allocTotal = allocTotal;
  let treasuryAlloc = specificTreasuryAlloc;
  if (treasuryAlloc == BigInt.fromI32(0)) {
    treasuryAlloc = defaultTreasuryAlloc;
  }
  vault.treasuryAlloc = treasuryAlloc;

  return vault;
}

function getVaultAddress(vaultId: BigInt, feeDistributorInstance: NFTXFeeDistributor): Address {
  let vaultFactoryAddressFromInstance = feeDistributorInstance.try_nftxVaultFactory();
  let vaultFactoryAddress = vaultFactoryAddressFromInstance.reverted ? ADDRESS_ZERO : vaultFactoryAddressFromInstance.value;

  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddressFromInstance = vaultFactoryInstance.try_vault(vaultId);
  let vaultAddress = vaultAddressFromInstance.reverted ? ADDRESS_ZERO : vaultAddressFromInstance.value;

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

export function handleFeeReceiverAllocChange(
  event: FeeReceiverAllocChangeEvent,
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
