import { Vault } from '../types/schema';
import {
  NewVault as NewVaultEvent,
  // TODO: update this to NewFeeDistributor
  NewFeeReceiver as NewFeeDistributorEvent,
  NFTXVaultFactoryUpgradeable as NFTXVaultFactory,
} from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultFactoryUpgradeable';
import { NFTXVaultUpgradeable as NFTXVault } from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultUpgradeable';
import { NFTXFeeDistributor } from '../types/NFTXVaultFactoryUpgradeable/NFTXFeeDistributor';
import {
  getGlobal,
  getAsset,
  getToken,
  getManager,
  getFees,
  getFeatures,
} from './helpers';
import { ADDRESS_ZERO } from './constants';
import { BigInt, log } from '@graphprotocol/graph-ts';

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

  let vaultInstance = NFTXVault.bind(vaultAddress);

  let vault = new Vault(vaultAddress.toHexString());
  vault.vaultId = event.params.vaultId;
  vault.is1155 = vaultInstance.is1155();
  vault.allowAllItems = vaultInstance.allowAllItems();

  let token = getToken(vaultAddress);
  vault.token = token.id;
  token.save();

  let asset = getAsset(event.params.assetAddress);
  vault.asset = asset.id;
  let assetVaults = asset.vaults;
  assetVaults.push(vault.id);
  asset.vaults = assetVaults;
  asset.save();

  let managerAddress = vaultInstance.manager();
  let manager = getManager(managerAddress);
  vault.manager = manager.id;
  vault.isFinalized = manager.id == ADDRESS_ZERO.toHexString();
  let managerVaults = manager.vaults;
  managerVaults.push(vault.id);
  manager.vaults = managerVaults;
  manager.save();

  vault.holdings = new Array<BigInt>();
  vault.mints = new Array<string>();
  vault.redeems = new Array<string>();
  vault.stakingPools = new Array<string>();
  vault.feeReceivers = new Array<string>();
  vault.feeReceipts = new Array<string>();
  vault.totalFees = BigInt.fromI32(0);
  vault.treasuryAlloc = BigInt.fromI32(0);
  vault.allocTotal = BigInt.fromI32(0);

  let fees = getFees(vaultAddress);
  vault.fees = fees.id;
  fees.save();

  let features = getFeatures(vaultAddress);
  vault.features = features.id;
  features.save();

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
