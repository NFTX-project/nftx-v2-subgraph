import {
  AddFeeReceiver as AddFeeReceiverEvent,
  FeeReceiverAllocChange as FeeReceiverAllocChangeEvent,
  RemoveFeeReceiver as RemoveFeeReceiverEvent,
  NFTXFeeDistributor,
} from '../types/NFTXFeeDistributor/NFTXFeeDistributor';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/NFTXFeeDistributor/NFTXVaultFactoryUpgradeable';
import { getFeeReceiver, getVault } from './helpers';
import { BigInt, store } from '@graphprotocol/graph-ts';

export function handleAddFeeReceiver(event: AddFeeReceiverEvent): void {
  let feeReceiverAddress = event.params.receiver;
  let vaultId = event.params.vaultId;

  let feeReceiver = getFeeReceiver(vaultId, feeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);
  let vaultFactoryAddress = feeDistributorInstance.nftxVaultFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let vault = getVault(vaultAddress);

  feeReceiver.vault = vault.id;
  feeReceiver.allocPoint = event.params.allocPoint;

  feeReceiver.save();

  vault.allocTotal = feeDistributorInstance.allocTotal(vaultId);
  let treasuryAlloc = feeDistributorInstance.specificTreasuryAlloc(vaultId);
  if (treasuryAlloc == BigInt.fromI32(0)) {
    treasuryAlloc = feeDistributorInstance.defaultTreasuryAlloc();
  }
  vault.treasuryAlloc = treasuryAlloc;
  vault.save();
}

export function handleFeeReceiverAllocChange(
  event: FeeReceiverAllocChangeEvent,
): void {
  let feeReceiverAddress = event.params.receiver;
  let vaultId = event.params.vaultId;

  let feeReceiver = getFeeReceiver(vaultId, feeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);
  let vaultFactoryAddress = feeDistributorInstance.nftxVaultFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let vault = getVault(vaultAddress);

  feeReceiver.vault = vault.id;
  feeReceiver.allocPoint = event.params.allocPoint;

  feeReceiver.save();

  vault.allocTotal = feeDistributorInstance.allocTotal(vaultId);
  let treasuryAlloc = feeDistributorInstance.specificTreasuryAlloc(vaultId);
  if (treasuryAlloc == BigInt.fromI32(0)) {
    treasuryAlloc = feeDistributorInstance.defaultTreasuryAlloc();
  }
  vault.treasuryAlloc = treasuryAlloc;
  vault.save();
}

export function handleRemoveFeeReceiver(event: RemoveFeeReceiverEvent): void {
  let feeReceiverAddress = event.params.receiver;
  let vaultId = event.params.vaultId;

  let feeReceiver = getFeeReceiver(vaultId, feeReceiverAddress);

  let feeDistributorInstance = NFTXFeeDistributor.bind(event.address);
  let vaultFactoryAddress = feeDistributorInstance.nftxVaultFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let vault = getVault(vaultAddress);

  store.remove('FeeReceiver', feeReceiver.id);

  vault.allocTotal = feeDistributorInstance.allocTotal(vaultId);
  let treasuryAlloc = feeDistributorInstance.specificTreasuryAlloc(vaultId);
  if (treasuryAlloc == BigInt.fromI32(0)) {
    treasuryAlloc = feeDistributorInstance.defaultTreasuryAlloc();
  }
  vault.treasuryAlloc = treasuryAlloc;
  vault.save();
}
