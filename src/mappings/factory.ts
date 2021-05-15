import {
  NewVault as NewVaultEvent,
  // TODO: update this to NewFeeDistributor
  NewFeeReceiver as NewFeeDistributorEvent,
  NFTXVaultFactoryUpgradeable as NFTXVaultFactory,
} from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultFactoryUpgradeable';
import { NFTXFeeDistributor } from '../types/NFTXVaultFactoryUpgradeable/NFTXFeeDistributor';
import { getGlobal, getVault } from './helpers';
import { log } from '@graphprotocol/graph-ts';

export function handleNewFeeDistributor(event: NewFeeDistributorEvent): void {
  let global = getGlobal();
  global.nftxVaultFactory = event.address;
  let feeDistributerAddress = event.params.newReceiver;
  let feeDistributor = NFTXFeeDistributor.bind(feeDistributerAddress);
  global.feeDistributorAddress = feeDistributerAddress;
  global.treasuryAddress = feeDistributor.treasury();
  global.lpStakingAddress = feeDistributor.lpStaking();
  global.defaultLpAlloc = feeDistributor.defaultLPAlloc();
  global.defaultTreasuryAlloc = feeDistributor.defaultTreasuryAlloc();
  global.save();
}

export function handleNewVault(event: NewVaultEvent): void {
  let vaultAddress = event.params.vaultAddress;
  log.info('new vault {}', [vaultAddress.toHexString()]);

  let vault = getVault(vaultAddress);
  vault.vaultId = event.params.vaultId;
  vault.save();

  let global = getGlobal();
  global.nftxVaultFactory = event.address;
  let factoryInstance = NFTXVaultFactory.bind(event.address);
  let feeDistributerAddress = factoryInstance.feeReceiver(); // TODO: update this to feeDistributor
  let feeDistributor = NFTXFeeDistributor.bind(feeDistributerAddress);
  global.feeDistributorAddress = feeDistributerAddress;
  global.treasuryAddress = feeDistributor.treasury();
  global.lpStakingAddress = feeDistributor.lpStaking();
  global.defaultLpAlloc = feeDistributor.defaultLPAlloc();
  global.defaultTreasuryAlloc = feeDistributor.defaultTreasuryAlloc();
  global.save();
}
