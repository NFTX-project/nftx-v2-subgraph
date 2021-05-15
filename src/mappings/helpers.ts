import { dataSource, BigInt, Address } from '@graphprotocol/graph-ts';
import { NFTXVaultUpgradeable as NFTXVault } from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultUpgradeable';
import {
  Global,
  Asset,
  Token,
  Manager,
  Fees,
  Features,
  Vault,
} from '../types/schema';
import { ERC20Metadata } from '../types/NFTXVaultFactoryUpgradeable/ERC20Metadata';
import { ERC677Metadata } from '../types/NFTXVaultFactoryUpgradeable/ERC677Metadata';
import { ADDRESS_ZERO } from './constants';

export function getGlobal(): Global {
  let global_id = dataSource.network();
  let global = Global.load(global_id);
  if (global == null) {
    global = new Global(global_id);
    global.totalHoldings = BigInt.fromI32(0);
    global.defaultTreasuryAlloc = BigInt.fromI32(0);
    global.defaultLpAlloc = BigInt.fromI32(0);
    global.treasuryAddress = ADDRESS_ZERO;
    global.lpStakingAddress = ADDRESS_ZERO;
    global.nftxVaultFactory = ADDRESS_ZERO;
    global.feeDistributorAddress = ADDRESS_ZERO;
  }
  return global as Global;
}

export function getAsset(assetAddress: Address): Asset {
  let asset = Asset.load(assetAddress.toHexString());
  if (asset == null) {
    asset = new Asset(assetAddress.toHexString());
    let erc677 = ERC677Metadata.bind(assetAddress);
    asset.name = erc677.name();
    asset.symbol = erc677.symbol();
    asset.vaults = new Array<string>();
  }
  return asset as Asset;
}

export function getToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHexString());
  if (token == null) {
    token = new Token(tokenAddress.toHexString());
    let erc20 = ERC20Metadata.bind(tokenAddress);
    token.name = erc20.name();
    token.symbol = erc20.symbol();
    token.totalSupply = erc20.totalSupply();
  }
  return token as Token;
}

export function getManager(managerAddress: Address): Manager {
  let manager = Manager.load(managerAddress.toHexString());
  if (manager == null) {
    manager = new Manager(managerAddress.toHexString());
    manager.vaults = new Array<string>();
  }
  return manager as Manager;
}

export function getFees(feesAddress: Address): Fees {
  let fees = Fees.load(feesAddress.toHexString());
  if (fees == null) {
    fees = new Fees(feesAddress.toHexString());
    fees.mintFee = BigInt.fromI32(0);
    fees.redeemFee = BigInt.fromI32(0);
    fees.directRedeemFee = BigInt.fromI32(0);
    fees.swapFee = BigInt.fromI32(0);
  }
  return fees as Fees;
}

export function getFeatures(featuresAddress: Address): Features {
  let features = Features.load(featuresAddress.toHexString());
  if (features == null) {
    features = new Features(featuresAddress.toHexString());
    features.enableMint = false;
    features.enableRedeem = false;
    features.enableDirectRedeem = false;
    features.enableSwap = false;
  }
  return features as Features;
}

export function getVault(vaultAddress: Address): Vault {
  let vault = Vault.load(vaultAddress.toHexString());
  if (vault == null) {
    vault = new Vault(vaultAddress.toHexString());
    let vaultInstance = NFTXVault.bind(vaultAddress);
    vault.is1155 = vaultInstance.is1155();
    vault.allowAllItems = vaultInstance.allowAllItems();
    vault.vaultId = BigInt.fromI32(0);

    let token = getToken(vaultAddress);
    vault.token = token.id;
    token.save();

    let assetAddress = vaultInstance.assetAddress();
    let asset = getAsset(assetAddress);
    vault.asset = asset.id;
    let assetVaults = asset.vaults;
    assetVaults.push(vault.id);
    asset.vaults = assetVaults;
    asset.save();

    let managerAddress = vaultInstance.manager();
    let manager = getManager(managerAddress);

    vault.manager = manager.id;
    vault.isFinalized = false;

    let fees = getFees(vaultAddress);
    vault.fees = fees.id;
    fees.save();

    let features = getFeatures(vaultAddress);
    vault.features = features.id;
    features.save();

    vault.holdings = new Array<BigInt>();
    vault.mints = new Array<string>();
    vault.redeems = new Array<string>();
    vault.stakingPools = new Array<string>();
    vault.feeReceivers = new Array<string>();
    vault.feeReceipts = new Array<string>();
    vault.totalFees = BigInt.fromI32(0);
    vault.treasuryAlloc = BigInt.fromI32(0);
    vault.allocTotal = BigInt.fromI32(0);
  }

  return vault as Vault;
}
