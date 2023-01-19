import {
  store,
  dataSource,
  Bytes,
  BigInt,
  Address,
  TypedMap,
  log,
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
  SimpleFeeReceiver,
  FeeReceipt,
  Pool,
  User,
  Mint,
  Swap,
  Redeem,
  StakedLpUser,
  Reward,
  Deposit,
  Holding,
  Zap,
  VaultCreator,
  EligibilityModule,
  Withdrawal,
  InventoryPool,
  ZapBuy,
  ZapSell,
  ZapSwap,
  FeeTransfer,
  DustReturned,
  VaultPublished,
  VaultCreated,
} from '../types/schema';
import { ERC20Metadata } from '../types/NFTXVaultFactoryUpgradeable/ERC20Metadata';
import { ERC677Metadata } from '../types/NFTXVaultFactoryUpgradeable/ERC677Metadata';
import { ADDRESS_ZERO } from './constants';

export function getGlobal(): Global {
  let global_id = dataSource.network();
  
  log.info('dataSource.network() {}', [global_id]);

  let global = Global.load(global_id);
  if (!global) {
    global = new Global(global_id);
    global.totalHoldings = BigInt.fromI32(0);
    global.defaultTreasuryAlloc = BigInt.fromI32(0);
    global.defaultLpAlloc = BigInt.fromI32(0);
    global.treasuryAddress = ADDRESS_ZERO;
    global.lpStakingAddress = ADDRESS_ZERO;
    global.inventoryStakingAddress = ADDRESS_ZERO;
    global.nftxVaultFactory = ADDRESS_ZERO;
    global.feeDistributorAddress = ADDRESS_ZERO;
    global.eligibilityManagerAddress = ADDRESS_ZERO;
    global.inventoryStakingAddress = ADDRESS_ZERO;
    let fees = getGlobalFee();
    fees.save();

    global.fees = 'global';
  }
  return global as Global;
}

export function getAsset(assetAddress: Address): Asset {
  let asset = Asset.load(assetAddress.toHexString());
  if (!asset) {
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
  if (!token) {
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
  if (!manager) {
    manager = new Manager(managerAddress.toHexString());
  }
  return manager as Manager;
}

export function getGlobalFee(): Fee {
  let feeId = 'global';
  let fees = Fee.load(feeId);
  if (!fees) {
    fees = new Fee(feeId);
    fees.mintFee = BigInt.fromI32(0);
    fees.randomRedeemFee = BigInt.fromI32(0);
    fees.targetRedeemFee = BigInt.fromI32(0);
    fees.swapFee = BigInt.fromI32(0);
    fees.randomSwapFee = BigInt.fromI32(0);
    fees.targetSwapFee = BigInt.fromI32(0);
  }
  return fees as Fee;
}

export function getFee(feesAddress: Address): Fee {
  let fees = Fee.load(feesAddress.toHexString());
  if (!fees) {
    fees = new Fee(feesAddress.toHexString());
    fees.mintFee = BigInt.fromI32(0);
    fees.randomRedeemFee = BigInt.fromI32(0);
    fees.targetRedeemFee = BigInt.fromI32(0);
    fees.swapFee = BigInt.fromI32(0);
    fees.randomSwapFee = BigInt.fromI32(0);
    fees.targetSwapFee = BigInt.fromI32(0);
  }
  return fees as Fee;
}

export function getFeature(featuresAddress: Address): Feature {
  let features = Feature.load(featuresAddress.toHexString());
  if (!features) {
    features = new Feature(featuresAddress.toHexString());
    features.enableMint = false;
    features.enableRandomRedeem = false;
    features.enableTargetRedeem = false;
    features.enableRandomSwap = false;
    features.enableTargetSwap = false;
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
  if (!vault) {
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

    vault.totalFees = BigInt.fromI32(0);
    vault.treasuryAlloc = BigInt.fromI32(0);
    vault.allocTotal = BigInt.fromI32(0);

    vault.createdAt = BigInt.fromI32(0);

    vault.totalMints = BigInt.fromI32(0);
    vault.totalSwaps = BigInt.fromI32(0);
    vault.totalRedeems = BigInt.fromI32(0);
    vault.totalHoldings = BigInt.fromI32(0);
    vault.usesFactoryFees = true;
    vault.shutdownDate = BigInt.fromI32(0);
  }

  return vault as Vault;
}

export function getVaultCreator(address: Address): VaultCreator {
  let vaultCreator = VaultCreator.load(address.toHexString());
  if (!vaultCreator) {
    vaultCreator = new VaultCreator(address.toHexString());
  }
  return vaultCreator as VaultCreator;
}

export function getSimpleFeeReceiver(
  feeReceiverAddress: Address,
): SimpleFeeReceiver {
  let feeReceiverId = feeReceiverAddress.toHexString();
  let feeReceiver = SimpleFeeReceiver.load(feeReceiverId);
  if (!feeReceiver) {
    feeReceiver = new SimpleFeeReceiver(feeReceiverId);
    feeReceiver.receiver = feeReceiverAddress;
    feeReceiver.allocPoint = BigInt.fromI32(0);
  }
  return feeReceiver as SimpleFeeReceiver;
}

export function getFeeReceiver(
  vaultId: BigInt,
  feeReceiverAddress: Address,
): FeeReceiver {
  let feeReceiverId =
    vaultId.toHexString() + '-' + feeReceiverAddress.toHexString();
  let feeReceiver = FeeReceiver.load(feeReceiverId);
  if (!feeReceiver) {
    feeReceiver = new FeeReceiver(feeReceiverId);
    feeReceiver.allocPoint = BigInt.fromI32(0);
    // vault not set
  }
  return feeReceiver as FeeReceiver;
}

export function getFeeReceipt(txHash: Bytes): FeeReceipt {
  let feeReceiptId = txHash.toHexString();
  let feeReceipt = FeeReceipt.load(feeReceiptId);
  if (!feeReceipt) {
    feeReceipt = new FeeReceipt(feeReceiptId);
    feeReceipt.date = BigInt.fromI32(0);
    // vault not set
    // token not set
  }
  return feeReceipt as FeeReceipt;
}

export function getFeeTransfer(txHash: Bytes, to: Address): FeeTransfer {
  let feeTransferId = txHash.toHexString() + '-' + to.toHexString();
  let feeTransfer = FeeTransfer.load(feeTransferId);
  if (!feeTransfer) {
    feeTransfer = new FeeTransfer(feeTransferId);
  }
  return feeTransfer as FeeTransfer;
}

export function getPool(poolAddress: Address, blockNumber: BigInt): Pool {
  let poolId = poolAddress.toHexString();
  let pool = Pool.load(poolId);
  if (!pool) {
    pool = new Pool(poolId);
    pool.deployBlock = blockNumber;
    pool.totalRewards = BigInt.fromI32(0);
    // vault and tokens not set
  }
  return pool as Pool;
}

export function getInventoryPool(poolAddress: Address): InventoryPool {
  let pool = InventoryPool.load(poolAddress.toHexString());
  if (!pool) {
    pool = new InventoryPool(poolAddress.toHexString());
  }
  return pool as InventoryPool;
}

export function getUser(userAddress: Address): User {
  let user = User.load(userAddress.toHexString());
  if (!user) {
    user = new User(userAddress.toHexString());
  }
  return user as User;
}
export function getMint(txHash: Bytes,  source: Address = ADDRESS_ZERO): Mint {
  let mint = Mint.load("MINT-" + txHash.toHexString());
  if (!mint) {
    mint = new Mint("MINT-" + txHash.toHexString());
    mint.source = source;
  }
  return mint as Mint;
}

export function getSwap(txHash: Bytes, source: Address =ADDRESS_ZERO): Swap {
  let swap = Swap.load("SWAP-" + txHash.toHexString());
  if (!swap) {
    swap = new Swap("SWAP-" + txHash.toHexString());
    swap.source = source;
  }
  return swap as Swap;
}

export function getZap(
  vaultId: BigInt,
  userAddress: Address,
  contractAddress: Address,
): Zap {
  let zapId =
    vaultId.toHexString() +
    '-' +
    userAddress.toHexString() +
    '-' +
    contractAddress.toHexString().substr(2, 6);
  let zap = Zap.load(zapId);
  if (!zap) {
    zap = new Zap(zapId);
    zap.amount = BigInt.fromI32(0);
    zap.contractAddress = contractAddress;
  }
  return zap as Zap;
}

export function getRedeem(txHash: Bytes, source: Address = ADDRESS_ZERO): Redeem {
  let redeem = Redeem.load("REDEEM-" + txHash.toHexString());
  if (!redeem) {
    redeem = new Redeem("REDEEM-" + txHash.toHexString());
    redeem.source = source;
  }
  return redeem as Redeem;
}

export function getStakedLpUser(userAddress: Address): StakedLpUser {
  let user = StakedLpUser.load(userAddress.toHexString());
  if (!user) {
    user = new StakedLpUser(userAddress.toHexString());
    user.activePools = new Array<string>();
  }
  return user as StakedLpUser;
}

export function getReward(txHash: Bytes): Reward {
  let rewardId = txHash.toHexString();
  let rewards = Reward.load(rewardId);
  if (!rewards) {
    rewards = new Reward(rewardId);
  }
  return rewards as Reward;
}

export function updatePools(
  user: StakedLpUser,
  poolAddress: Address,
  add: boolean = true,
): StakedLpUser {
  // let poolsMap = new TypedMap<string, boolean>();
  // let userPools = user.stakedPools;
  // for (let i = 0; i < userPools.length; i = i + 1) {
  //   poolsMap.set(userPools[i], true);
  // }
  // poolsMap.set(poolAddress.toHexString(), true);
  // let pools = new Array<string>();
  // let poolsEntries = poolsMap.entries;
  // for (let i = 0; i < poolsEntries.length; i = i + 1) {
  //   let entry = poolsEntries[i];
  //   if (entry.value == true) {
  //     pools.push(entry.key);
  //   }
  // }
  // user.stakedPools = pools;

  let activePoolsMap = new TypedMap<string, boolean>();
  let userActivePools = user.activePools;
  for (let i = 0; i < userActivePools.length; i = i + 1) {
    activePoolsMap.set(userActivePools[i], true);
  }
  activePoolsMap.set(poolAddress.toHexString(), add);
  let activePools = new Array<string>();
  let activePoolsEntries = activePoolsMap.entries;
  for (let i = 0; i < activePoolsEntries.length; i = i + 1) {
    let entry = activePoolsEntries[i];
    if (entry.value == true) {
      activePools.push(entry.key);
    }
  }
  user.activePools = activePools;
  return user;
}

export function getDeposit(txHash: Bytes): Deposit {
  let depositId = "DEPOSIT-" + txHash.toHexString();
  let deposit = Deposit.load(depositId);
  if (!deposit) {
    deposit = new Deposit(depositId);
    deposit.deposit = BigInt.fromI32(0);
    deposit.date = BigInt.fromI32(0);
  }
  return deposit as Deposit;
}

export function getWithdrawal(txHash: Bytes): Withdrawal {
  let withdrawalId = "WITHDRAWAL-" + txHash.toHexString();
  let withdrawal = Withdrawal.load(withdrawalId);
  if (!withdrawal) {
    withdrawal = new Withdrawal(withdrawalId);
    withdrawal.withdrawal = BigInt.fromI32(0);
    withdrawal.date = BigInt.fromI32(0);
  }
  return withdrawal as Withdrawal;
}

export function getHolding(tokenId: BigInt, vaultAddress: Address): Holding {
  let holdingId = tokenId.toHexString() + '-' + vaultAddress.toHexString();
  let holding = Holding.load(holdingId);
  if (!holding) {
    holding = new Holding(holdingId);
    holding.tokenId = tokenId;
    holding.amount = BigInt.fromI32(0);
    holding.vault = vaultAddress.toHexString();
  }
  return holding as Holding;
}

export function addToHoldings(
  vaultAddress: Address,
  nftIds: BigInt[],
  amounts: BigInt[],
  date: BigInt,
): void {
  let vault = getVault(vaultAddress);
  let is1155 = vault.is1155;
  for (let i = 0; i < nftIds.length; i = i + 1) {
    let tokenId = nftIds[i];
    let holding = getHolding(tokenId, vaultAddress);
    holding.dateAdded = date;
    if (is1155) {
      let amount = amounts[i];
      holding.amount = holding.amount.plus(amount);
    } else {
      holding.amount = BigInt.fromI32(1);
    }
    holding.save();
  }
}

/**
 * Ensures that
 */
export function transformMintAmounts(
  vaultAddress: Address,
  nftIds: BigInt[],
  amounts: BigInt[],
): BigInt[] {
  let vault = getVault(vaultAddress);
  let is1155 = vault.is1155;
  if (is1155) {
    // No transformation needed, amounts are enforced in the call
    return amounts;
  }
  // Amounts not enforced, map all ERC721s to ensure thay have an `amount` of 1 in the response
  let transformedAmounts = new Array<BigInt>();
  for (let i = 0; i < nftIds.length; i = i + 1) {
    transformedAmounts[i] = BigInt.fromI32(1);
  }
  return transformedAmounts;
}

export function removeFromHoldings(
  vaultAddress: Address,
  nftIds: BigInt[],
): void {
  for (let i = 0; i < nftIds.length; i = i + 1) {
    let tokenId = nftIds[i];
    let holding = getHolding(tokenId, vaultAddress);
    holding.amount =
      holding.amount == BigInt.fromI32(0)
        ? BigInt.fromI32(0)
        : holding.amount.minus(BigInt.fromI32(1));
    holding.save();
    if (holding.amount == BigInt.fromI32(0)) {
      store.remove('Holding', holding.id);
    }
  }
}



export function getEligibilityModule(
  moduleAddress: Address,
): EligibilityModule {
  let module = EligibilityModule.load(moduleAddress.toHexString());
  if (!module) {
    module = new EligibilityModule(moduleAddress.toHexString());
    module.eligibilityManager = ADDRESS_ZERO;
    module.targetAsset = ADDRESS_ZERO.toHexString();
    module.finalized = false;
    module.finalizedOnDeploy = false;
    module.name = '';
  }
  return module as EligibilityModule;
}

export function updateEligibleTokenIds(
  module: EligibilityModule,
  tokenIds: BigInt[],
  add: boolean = true,
): EligibilityModule {
  let idsMap = new TypedMap<BigInt, boolean>();
  let moduleIds =
    module.eligibleIds == null
      ? new Array<BigInt>()
      : (module.eligibleIds as BigInt[]);
  for (let i = 0; i < moduleIds.length; i = i + 1) {
    idsMap.set(moduleIds[i], true);
  }
  for (let i = 0; i < tokenIds.length; i = i + 1) {
    idsMap.set(tokenIds[i], add);
  }
  let ids = new Array<BigInt>();
  let entries = idsMap.entries;
  for (let i = 0; i < entries.length; i = i + 1) {
    let entry = entries[i];
    if (entry.value == true) {
      ids.push(entry.key);
    }
  }
  if (ids.length == 0) {
    module.eligibleIds = null;
  } else {
    module.eligibleIds = ids;
  }
  return module;
}

export function getZapBuy(txHash: Bytes): ZapBuy {
  let zapBuy = ZapBuy.load(txHash.toHexString());
  if (!zapBuy) {
    zapBuy = new ZapBuy(txHash.toHexString());
  }
  return zapBuy as ZapBuy;
}

export function getZapSell(txHash: Bytes): ZapSell {
  let zapSell = ZapSell.load(txHash.toHexString());
  if (!zapSell) {
    zapSell = new ZapSell(txHash.toHexString());
  }
  return zapSell as ZapSell;
}

export function getZapSwap(txHash: Bytes): ZapSwap {
  let zapSwap = ZapSwap.load(txHash.toHexString());
  if (!zapSwap) {
    zapSwap = new ZapSwap(txHash.toHexString());
  }
  return zapSwap as ZapSwap;
}

export function getDustReturned(txHash: Bytes) : DustReturned | null {
  return DustReturned.load(txHash.toHexString())
}

export function createDustReturned(txHash: Bytes, eventID: string) : DustReturned {
  let dustReturned = DustReturned.load(txHash.toHexString());
  if(!dustReturned) {
    let dustReturned = new DustReturned(txHash.toHexString());

    let eventList = new Array<string>();
    eventList.push(eventID);

    dustReturned.ethAmount = BigInt.fromI32(0);
    dustReturned.vTokenAmount = BigInt.fromI32(0);
    dustReturned.to = ADDRESS_ZERO.toHexString();
    dustReturned.linkedEvents = eventList;
    dustReturned.save();
    return dustReturned;
  }
  else {
    let linkedEvents = dustReturned.linkedEvents;
    linkedEvents.push(eventID);
    dustReturned.linkedEvents = linkedEvents;
    dustReturned.save();
    return dustReturned;
  }
}

export function vaultCreated(txHash: Bytes, vaultId: string, date: BigInt) : void {
  let vaultCreated = new VaultCreated("VAULT_CREATED-" + txHash.toHexString());
  vaultCreated.date = date;
  vaultCreated.vault = vaultId;
  vaultCreated.source = ADDRESS_ZERO;
  vaultCreated.type = "VaultCreated";
  vaultCreated.save()
}

export function vaultPublished(txHash: Bytes, vaultId: string, date: BigInt) : void {
  let vaultPublished = new VaultPublished("VAULT_PUBLISHED-" + txHash.toHexString());
  vaultPublished.date = date;
  vaultPublished.vault = vaultId;
  vaultPublished.source = ADDRESS_ZERO;
  vaultPublished.type = "VaultPublished";
  vaultPublished.save()
}

