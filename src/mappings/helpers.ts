import {
  dataSource,
  Bytes,
  BigInt,
  Address,
  TypedMap,
} from '@graphprotocol/graph-ts';
import { NFTXVaultUpgradeable as NFTXVault } from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultUpgradeable';
import {
  Global,
  Asset,
  Token,
  Manager,
  Fee,
  Feature,
  Vault,
  FeeReceiver,
  FeeReceipt,
  Pool,
  User,
  Mint,
  Redeem,
  StakedLpUser,
  Reward,
  Deposit,
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
    let symbol = erc677.try_symbol();
    let name = erc677.try_name();

    asset.symbol = symbol.reverted ? '' : symbol.value;
    asset.name = name.reverted ? '' : name.value;
  }
  return asset as Asset;
}

export function getToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHexString());
  if (token == null) {
    token = new Token(tokenAddress.toHexString());
  }
  let erc20 = ERC20Metadata.bind(tokenAddress);
  let symbol = erc20.try_symbol();
  let name = erc20.try_name();
  let totalSupply = erc20.try_totalSupply();

  token.symbol = symbol.reverted ? '' : symbol.value;
  token.name = name.reverted ? '' : name.value;
  token.totalSupply = totalSupply.reverted
    ? BigInt.fromI32(0)
    : totalSupply.value;
  return token as Token;
}

export function getManager(managerAddress: Address): Manager {
  let manager = Manager.load(managerAddress.toHexString());
  if (manager == null) {
    manager = new Manager(managerAddress.toHexString());
  }
  return manager as Manager;
}

export function getFee(feesAddress: Address): Fee {
  let fees = Fee.load(feesAddress.toHexString());
  if (fees == null) {
    fees = new Fee(feesAddress.toHexString());
    fees.mintFee = BigInt.fromI32(0);
    fees.randomRedeemFee = BigInt.fromI32(0);
    fees.directRedeemFee = BigInt.fromI32(0);
    fees.swapFee = BigInt.fromI32(0);
  }
  return fees as Fee;
}

export function getFeature(featuresAddress: Address): Feature {
  let features = Feature.load(featuresAddress.toHexString());
  if (features == null) {
    features = new Feature(featuresAddress.toHexString());
    features.enableMint = false;
    features.enableRandomRedeem = false;
    features.enableDirectRedeem = false;
    features.enableSwap = false;
  }
  return features as Feature;
}

export function updateManager(vault: Vault, managerAddress: Address): Vault {
  let manager = getManager(managerAddress);
  manager.save();

  vault.manager = manager.id;
  vault.isFinalized =
    managerAddress.toHexString() == ADDRESS_ZERO.toHexString();

  return vault;
}

export function getVault(vaultAddress: Address): Vault {
  let vault = Vault.load(vaultAddress.toHexString());
  if (vault == null) {
    vault = new Vault(vaultAddress.toHexString());

    let vaultInstance = NFTXVault.bind(vaultAddress);
    let assetAddressFromInstance = vaultInstance.try_assetAddress();
    let managerAddressFromInstance = vaultInstance.try_manager();
    let is1155FromInstance = vaultInstance.try_is1155();
    let allowAllItemsFromInstance = vaultInstance.try_allowAllItems();

    let assetAddress = assetAddressFromInstance.reverted
      ? ADDRESS_ZERO
      : assetAddressFromInstance.value;
    let managerAddress = managerAddressFromInstance.reverted
      ? ADDRESS_ZERO
      : managerAddressFromInstance.value;
    let is1155 = is1155FromInstance.reverted ? false : is1155FromInstance.value;
    let allowAllItems = allowAllItemsFromInstance.reverted
      ? false
      : allowAllItemsFromInstance.value;

    vault.is1155 = is1155;
    vault.allowAllItems = allowAllItems;
    vault.vaultId = BigInt.fromI32(0);

    let token = getToken(vaultAddress);
    vault.token = token.id;
    token.save();

    let asset = getAsset(assetAddress);
    vault.asset = asset.id;
    asset.save();

    vault = updateManager(vault as Vault, managerAddress);

    let fees = getFee(vaultAddress);
    vault.fees = fees.id;
    fees.save();

    let features = getFeature(vaultAddress);
    vault.features = features.id;
    features.save();

    vault.holdings = new Array<BigInt>();
    vault.totalFees = BigInt.fromI32(0);
    vault.treasuryAlloc = BigInt.fromI32(0);
    vault.allocTotal = BigInt.fromI32(0);
  }

  return vault as Vault;
}

export function getFeeReceiver(
  vaultId: BigInt,
  feeReceiverAddress: Address,
): FeeReceiver {
  let feeReceiverId =
    vaultId.toHexString() + '-' + feeReceiverAddress.toHexString();
  let feeReceiver = FeeReceiver.load(feeReceiverId);
  if (feeReceiver == null) {
    feeReceiver = new FeeReceiver(feeReceiverId);
    feeReceiver.allocPoint = BigInt.fromI32(0);
    // vault not set
  }
  return feeReceiver as FeeReceiver;
}

export function getFeeReceipt(txHash: Bytes): FeeReceipt {
  let feeReceiptId = txHash.toHexString();
  let feeReceipt = FeeReceipt.load(feeReceiptId);
  if (feeReceipt == null) {
    feeReceipt = new FeeReceipt(feeReceiptId);
    feeReceipt.amount = BigInt.fromI32(0);
    feeReceipt.date = BigInt.fromI32(0);
    // vault not set
    // token not set
  }
  return feeReceipt as FeeReceipt;
}

export function getPool(poolAddress: Address): Pool {
  let poolId = poolAddress.toHexString();
  let pool = Pool.load(poolId);
  if (pool == null) {
    pool = new Pool(poolId);
    pool.totalRewards = BigInt.fromI32(0);
    pool.vaultTokensStaked = BigInt.fromI32(0);
    // vault and tokens not set
  }
  return pool as Pool;
}

export function getUser(userAddress: Address): User {
  let user = User.load(userAddress.toHexString());
  if (user == null) {
    user = new User(userAddress.toHexString());
  }
  return user as User;
}

export function getMint(txHash: Bytes): Mint {
  let mint = Mint.load(txHash.toHexString());
  if (mint == null) {
    mint = new Mint(txHash.toHexString());
  }
  return mint as Mint;
}

export function getRedeem(txHash: Bytes): Redeem {
  let redeem = Redeem.load(txHash.toHexString());
  if (redeem == null) {
    redeem = new Redeem(txHash.toHexString());
  }
  return redeem as Redeem;
}

export function updateHoldings(
  vault: Vault,
  nftIds: BigInt[],
  add: boolean = true,
): Vault {
  let holdingsMap = new TypedMap<BigInt, boolean>();
  let vaultHoldings = vault.holdings;
  for (let i = 0; i < vaultHoldings.length; i = i + 1) {
    holdingsMap.set(vaultHoldings[i], true);
  }
  for (let i = 0; i < nftIds.length; i = i + 1) {
    holdingsMap.set(nftIds[i], add);
  }
  let holdings = new Array<BigInt>();
  let entries = holdingsMap.entries;
  for (let i = 0; i < entries.length; i = i + 1) {
    let entry = entries[i];
    if (entry.value == true) {
      holdings.push(entry.key);
    }
  }
  vault.holdings = holdings;
  return vault;
}

export function getStakedLpUser(userAddress: Address): StakedLpUser {
  let user = StakedLpUser.load(userAddress.toHexString());
  if (user == null) {
    user = new StakedLpUser(userAddress.toHexString());
    user.pools = new Array<string>();
    user.activePools = new Array<string>();
  }
  return user as StakedLpUser;
}

export function getReward(txHash: Bytes): Reward {
  let rewardId = txHash.toHexString();
  let rewards = Reward.load(rewardId);
  if (rewards == null) {
    rewards = new Reward(rewardId);
  }
  return rewards as Reward;
}

export function updatePools(
  user: StakedLpUser,
  poolAddress: Address,
  add: boolean = true,
): StakedLpUser {
  let poolsMap = new TypedMap<string, boolean>();
  let userPools = user.pools;
  for (let i = 0; i < userPools.length; i = i + 1) {
    poolsMap.set(userPools[i], true);
  }
  poolsMap.set(poolAddress.toHexString(), add);
  let pools = new Array<string>();
  let entries = poolsMap.entries;
  for (let i = 0; i < entries.length; i = i + 1) {
    let entry = entries[i];
    if (entry.value == true) {
      pools.push(entry.key);
    }
  }
  if (add == true) {
    user.pools = pools;
  }
  user.activePools = pools;
  return user;
}

var METHOD_SIGNATURE_LENGTH = 4;
var BYTES32_LENGTH = 32;
var reedemCall = Bytes.fromHexString('0xc4a0db96') as Bytes;
var reedemToCall = Bytes.fromHexString('0x9d54def6') as Bytes;

export function getSpecificIds(txData: Bytes): BigInt[] {
  let data = txData.subarray(METHOD_SIGNATURE_LENGTH);
  let method = txData.subarray(0, METHOD_SIGNATURE_LENGTH) as Bytes;

  if (method == reedemCall) {
    data = data.subarray(2 * BYTES32_LENGTH, data.length - BYTES32_LENGTH);
  } else if (method == reedemToCall) {
    data = data.subarray(3 * BYTES32_LENGTH, data.length - BYTES32_LENGTH);
  } else {
    return new Array<BigInt>();
  }
  let num = data.length / BYTES32_LENGTH;
  let specificIds = new Array<BigInt>();
  for (let i = 0; i < num; i = i + 1) {
    let idBytes = data.subarray(0, BYTES32_LENGTH) as Bytes;
    data = data.subarray(BYTES32_LENGTH);
    specificIds.push(BigInt.fromUnsignedBytes(idBytes));
  }
  return specificIds;
}

export function getDeposit(txHash: Bytes): Deposit {
  let depositId = txHash.toHexString();
  let deposit = Deposit.load(depositId);
  if (deposit == null) {
    deposit = new Deposit(depositId);
    deposit.deposit = BigInt.fromI32(0);
    deposit.date = BigInt.fromI32(0);
  }
  return deposit as Deposit;
}
