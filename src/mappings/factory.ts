import {
  NewVault as NewVaultEvent,
  // TODO: update this to NewFeeDistributor
  NewFeeReceiver as NewFeeDistributorEvent,
} from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultFactoryUpgradeable';
import { NFTXFeeDistributor } from '../types/NFTXVaultFactoryUpgradeable/NFTXFeeDistributor';
import { getGlobal, getVault } from './helpers';
import {
  NFTXVaultUpgradeable as NFTXVaultTemplate,
  NFTXFeeDistributor as NFTXFeeDistributorTemplate,
  NFTXLPStaking as NFTXLPStakingTemplate,
} from '../types/templates';

export function handleNewFeeDistributor(event: NewFeeDistributorEvent): void {
  let global = getGlobal();
  global.nftxVaultFactory = event.address;
  let feeDistributorAddress = event.params.newReceiver;
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

export function handleNewVault(event: NewVaultEvent): void {
  let vaultAddress = event.params.vaultAddress;

  let vault = getVault(vaultAddress);
  vault.vaultId = event.params.vaultId;
  vault.save();

  NFTXVaultTemplate.create(vaultAddress);
}
