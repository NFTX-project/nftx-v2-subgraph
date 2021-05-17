import {
  NewVault as NewVaultEvent,
  // TODO: update this to NewFeeDistributor
  NewFeeReceiver as NewFeeDistributorEvent,
  NFTXVaultFactoryUpgradeable as NFTXVaultFactory,
} from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultFactoryUpgradeable';
import { NFTXFeeDistributor } from '../types/NFTXVaultFactoryUpgradeable/NFTXFeeDistributor';
import { getGlobal, getVault } from './helpers';
import {
  NFTXVaultUpgradeable as NFTXVaultTemplate,
  NFTXFeeDistributor as NFTXFeeDistributorTemplate,
  NFTXLPStaking as NFTXLPStakingTemplate,
} from '../types/templates';
import { Address } from '@graphprotocol/graph-ts';

function newFeeDistributor(
  nftxVaultFactoryAddress: Address,
  feeDistributorAddress: Address,
): void {
  let global = getGlobal();
  if (global.feeDistributorAddress == feeDistributorAddress) {
    return;
  }
  global.nftxVaultFactory = nftxVaultFactoryAddress;
  let feeDistributor = NFTXFeeDistributor.bind(feeDistributorAddress);
  global.feeDistributorAddress = feeDistributorAddress;
  global.treasuryAddress = feeDistributor.treasury();
  let lpStakingAddress = feeDistributor.lpStaking();
  global.lpStakingAddress = lpStakingAddress;
  global.defaultLpAlloc = feeDistributor.defaultLPAlloc();
  global.defaultTreasuryAlloc = feeDistributor.defaultTreasuryAlloc();
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

  let vault = getVault(vaultAddress);
  vault.vaultId = event.params.vaultId;
  vault.save();

  NFTXVaultTemplate.create(vaultAddress);

  let nftxVaultFactoryAddress = event.address;
  let vaultFactory = NFTXVaultFactory.bind(nftxVaultFactoryAddress);
  let feeDistributorAddress = vaultFactory.feeReceiver(); // TODO: update this to FeeDistributor

  newFeeDistributor(nftxVaultFactoryAddress, feeDistributorAddress);
}
