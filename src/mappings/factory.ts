import {
  NewVault as NewVaultEvent,
  NewFeeDistributor as NewFeeDistributorEvent,
  NFTXVaultFactoryUpgradeable as NFTXVaultFactory,
} from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultFactoryUpgradeable';
import { NFTXFeeDistributor } from '../types/NFTXVaultFactoryUpgradeable/NFTXFeeDistributor';
import { getGlobal, getVault, getVaultCreator } from './helpers';
import {
  NFTXVaultUpgradeable as NFTXVaultTemplate,
  NFTXFeeDistributor as NFTXFeeDistributorTemplate,
  NFTXLPStaking as NFTXLPStakingTemplate,
} from '../types/templates';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ADDRESS_ZERO } from './constants';

function newFeeDistributor(
  nftxVaultFactoryAddress: Address,
  feeDistributorAddress: Address,
): void {
  let global = getGlobal();
  if (global.feeDistributorAddress == feeDistributorAddress) {
    return;
  }

  let feeDistributor = NFTXFeeDistributor.bind(feeDistributorAddress);
  let treasuryAddressFromInstance = feeDistributor.try_treasury();
  let lpStakingAddressFromInstance = feeDistributor.try_lpStaking();
  let defaultLPAllocFromInstance = feeDistributor.try_defaultLPAlloc();
  let defaultTreasuryAllocFromInstance =
    feeDistributor.try_defaultTreasuryAlloc();

  let treasuryAddress = treasuryAddressFromInstance.reverted
    ? ADDRESS_ZERO
    : treasuryAddressFromInstance.value;
  let lpStakingAddress = lpStakingAddressFromInstance.reverted
    ? ADDRESS_ZERO
    : lpStakingAddressFromInstance.value;
  let defaultLPAlloc = defaultLPAllocFromInstance.reverted
    ? BigInt.fromI32(0)
    : defaultLPAllocFromInstance.value;
  let defaultTreasuryAlloc = defaultTreasuryAllocFromInstance.reverted
    ? BigInt.fromI32(0)
    : defaultTreasuryAllocFromInstance.value;

  global.nftxVaultFactory = nftxVaultFactoryAddress;
  global.feeDistributorAddress = feeDistributorAddress;
  global.treasuryAddress = treasuryAddress;
  global.lpStakingAddress = lpStakingAddress;
  global.defaultLpAlloc = defaultLPAlloc;
  global.defaultTreasuryAlloc = defaultTreasuryAlloc;
  global.save();

  NFTXFeeDistributorTemplate.create(feeDistributorAddress);
  NFTXLPStakingTemplate.create(lpStakingAddress);
}

export function handleNewFeeDistributor(event: NewFeeDistributorEvent): void {
  let nftxVaultFactoryAddress = event.address;
  let feeDistributorAddress = event.params.newReceiver;

  newFeeDistributor(nftxVaultFactoryAddress, feeDistributorAddress);
}

export function handleNewVault(event: NewVaultEvent): void {
  let vaultAddress = event.params.vaultAddress;
  let vaultCreatorAddress = event.transaction.from;

  let vaultCreator = getVaultCreator(vaultCreatorAddress);
  vaultCreator.save();

  let vault = getVault(vaultAddress);
  vault.vaultId = event.params.vaultId;
  vault.createdAt = event.block.timestamp;
  vault.createdBy = vaultCreator.id;
  vault.save();

  NFTXVaultTemplate.create(vaultAddress);

  let nftxVaultFactoryAddress = event.address;

  let vaultFactory = NFTXVaultFactory.bind(nftxVaultFactoryAddress);
  let feeDistributorAddressFromInstance = vaultFactory.try_feeDistributor();
  let feeDistributorAddress = feeDistributorAddressFromInstance.reverted
    ? ADDRESS_ZERO
    : feeDistributorAddressFromInstance.value;

  newFeeDistributor(nftxVaultFactoryAddress, feeDistributorAddress);
}
