import { Address, log } from '@graphprotocol/graph-ts';
import {
  Transfer as TransferEvent,
  Minted as MintEvent,
  Swapped as SwapEvent,
  Redeemed as RedeemEvent,
  ManagerSet as ManagerSetEvent,
  EnableMintUpdated as EnableMintUpdatedEvent,
  EnableRandomRedeemUpdated as EnableRandomRedeemUpdatedEvent,
  EnableTargetRedeemUpdated as EnableTargetRedeemUpdatedEvent,
  EnableRandomSwapUpdated as EnableRandomSwapUpdatedEvent,
  EnableTargetSwapUpdated as EnableTargetSwapUpdatedEvent,
  EligibilityDeployed as EligibilityDeployedEvent,
  VaultShutdown as VaultShutdownEvent,
  MetaDataChange as MetaDataChangeEvent,
} from '../types/templates/NFTXVaultUpgradeable/NFTXVaultUpgradeable';
import { EligibilityModule as EligibilityModuleTemplate } from '../types/templates';
import { EligibilityModule as EligibilityModuleContract } from '../types/templates/EligibilityModule/EligibilityModule';
import { NFTXEligibilityManager as NFTXEligibilityManagerContract } from '../types/templates/EligibilityModule/NFTXEligibilityManager';
import {
  getGlobal,
  getSwap,
  getVault,
  getFeeReceipt,
  getMint,
  getUser,
  getRedeem,
  updateManager,
  getFeature,
  getToken,
  addToHoldings,
  removeFromHoldings,
  getEligibilityModule,
  transformMintAmounts,
  getFeeTransfer,
} from './helpers';
import { BigInt} from '@graphprotocol/graph-ts';


export function handleTransfer(event: TransferEvent): void {
  let global = getGlobal();
  let vaultAddress = event.address;
  if (event.params.from == global.feeDistributorAddress) {
    let feeReceipt = getFeeReceipt(event.transaction.hash);
    feeReceipt.vault = vaultAddress.toHexString();
    feeReceipt.token = vaultAddress.toHexString();
    feeReceipt.date = event.block.timestamp;
    feeReceipt.save();

    let feeTransfer = getFeeTransfer(event.transaction.hash, event.params.to);
    feeTransfer.to = event.params.to;
    feeTransfer.amount = event.params.value;
    feeTransfer.feeReceipt = feeReceipt.id;
    feeTransfer.save();

    let vault = getVault(vaultAddress);
    vault.totalFees = vault.totalFees.plus(event.params.value);
    vault.save();
  }

  let token = getToken(vaultAddress);
  token.save();
}

export function handleMint(event: MintEvent): void {
  let vaultAddress = event.address;

  let txHash = event.transaction.hash;
  let mint = getMint(txHash, event.logIndex);
  let user = getUser(event.params.to);
  let amounts = event.params.amounts;
  let nftIds = event.params.nftIds;
  mint.user = user.id;
  mint.vault = vaultAddress.toHexString();
  mint.date = event.block.timestamp;
  mint.nftIds = nftIds;
  mint.amounts = transformMintAmounts(vaultAddress, nftIds, amounts);
  
  
  if(event.transaction.to != vaultAddress){
    mint.source = event.transaction.to;
  }
  

  let feeReceipt = getFeeReceipt(event.transaction.hash);
  feeReceipt.vault = vaultAddress.toHexString();
  feeReceipt.token = vaultAddress.toHexString();
  feeReceipt.date = event.block.timestamp;
  feeReceipt.save();

  mint.feeReceipt = feeReceipt.id;

  mint.save();
  user.save();

  addToHoldings(vaultAddress, nftIds, amounts, event.block.timestamp);

  let added = BigInt.fromI32(nftIds.length);

  let token = getToken(vaultAddress);
  token.save();

  let vault = getVault(vaultAddress);

  if (vault.is1155) {
    added = BigInt.fromI32(0);
    for (let i = 0; i < amounts.length; i = i + 1) {
      added = added.plus(amounts[i]);
    }
  }

  vault.totalMints = vault.totalMints.plus(added);
  vault.totalHoldings = vault.totalHoldings.plus(added);
  vault.save();

  let global = getGlobal();
  global.totalHoldings = global.totalHoldings.plus(added);
  global.save();
}

export function handleSwap(event: SwapEvent): void {
  let vaultAddress = event.address;

  let txHash = event.transaction.hash;
  let swap = getSwap(txHash, event.logIndex);
  let nftIds = event.params.nftIds;
  let amounts = event.params.amounts;
  let specificIds = event.params.specificIds;
  let redeemedIds = event.params.redeemedIds;
  let user = getUser(event.params.to);

  swap.user = user.id;
  swap.vault = vaultAddress.toHexString();
  swap.date = event.block.timestamp;
  swap.mintedIds = nftIds;
  swap.mintedAmounts = amounts;
  swap.redeemedIds = redeemedIds;
  swap.specificIds = specificIds;
  swap.targetCount = BigInt.fromI32(specificIds.length);
  swap.randomCount = BigInt.fromI32(nftIds.length - specificIds.length);
  
  if(event.transaction.to != vaultAddress){
    swap.source = event.transaction.to;
  }

  let feeReceipt = getFeeReceipt(event.transaction.hash);
  feeReceipt.vault = vaultAddress.toHexString();
  feeReceipt.token = vaultAddress.toHexString();
  feeReceipt.date = event.block.timestamp;
  feeReceipt.save();
  
  swap.feeReceipt = feeReceipt.id;

  swap.save();
  user.save();

  addToHoldings(vaultAddress, nftIds, amounts, event.block.timestamp);
  removeFromHoldings(vaultAddress, redeemedIds);

  let added = BigInt.fromI32(nftIds.length);
  let removed = BigInt.fromI32(redeemedIds.length);

  let token = getToken(vaultAddress);
  token.save();

  let vault = getVault(vaultAddress);
  vault.totalSwaps = vault.totalRedeems.plus(BigInt.fromI32(1));

  if (vault.is1155) {
    added = BigInt.fromI32(0);
    for (let i = 0; i < amounts.length; i = i + 1) {
      added = added.plus(amounts[i]);
    }
  }

  vault.totalHoldings = vault.totalHoldings.plus(added).minus(removed);
  vault.save();

  let global = getGlobal();
  global.totalHoldings = global.totalHoldings.plus(added).minus(removed);
  global.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let vaultAddress = event.address;

  let txHash = event.transaction.hash;
  let redeem = getRedeem(txHash, event.logIndex);
  let nftIds = event.params.nftIds;
  let specificIds = event.params.specificIds;
  let user = getUser(event.params.to);

  redeem.user = user.id;
  redeem.vault = vaultAddress.toHexString();
  redeem.date = event.block.timestamp;
  redeem.nftIds = nftIds;
  redeem.specificIds = specificIds;
  redeem.targetCount = BigInt.fromI32(specificIds.length);
  redeem.randomCount = BigInt.fromI32(nftIds.length - specificIds.length);
  
  if(event.transaction.to != vaultAddress){
    redeem.source = event.transaction.to;
  }
  
  let feeReceipt = getFeeReceipt(event.transaction.hash);
  feeReceipt.vault = vaultAddress.toHexString();
  feeReceipt.token = vaultAddress.toHexString();
  feeReceipt.date = event.block.timestamp;
  feeReceipt.save();

  redeem.feeReceipt = feeReceipt.id;

  redeem.save();
  user.save();

  removeFromHoldings(vaultAddress, nftIds);
  let removed = BigInt.fromI32(nftIds.length);

  let token = getToken(vaultAddress);
  token.save();

  let vault = getVault(vaultAddress);
  vault.totalRedeems = vault.totalRedeems.plus(removed);
  vault.totalHoldings = vault.totalHoldings.minus(removed);
  vault.save();

  let global = getGlobal();
  global.totalHoldings = global.totalHoldings.minus(removed);
  global.save();
}

export function handleManagerSet(event: ManagerSetEvent): void {
  let managerAddress = event.params.manager;
  let vault = getVault(event.address);
  vault = updateManager(vault, managerAddress);
  vault.save();
}

export function handleEnableMintUpdated(event: EnableMintUpdatedEvent): void {
  let features = getFeature(event.address);
  features.enableMint = event.params.enabled;
  features.save();
}

export function handleEnableRandomRedeemUpdated(
  event: EnableRandomRedeemUpdatedEvent,
): void {
  let features = getFeature(event.address);
  features.enableRandomRedeem = event.params.enabled;
  features.save();
}

export function handleEnableTargetRedeemUpdated(
  event: EnableTargetRedeemUpdatedEvent,
): void {
  let features = getFeature(event.address);
  features.enableTargetRedeem = event.params.enabled;
  features.save();
}

export function handleEnableRandomSwapUpdated(event: EnableRandomSwapUpdatedEvent): void {
  let features = getFeature(event.address);
  features.enableRandomSwap = event.params.enabled;
  features.save();
}

export function handleEnableTargetSwapUpdated(event: EnableTargetSwapUpdatedEvent): void {
  let features = getFeature(event.address);
  features.enableTargetSwap = event.params.enabled;
  features.save();
}

export function handleEligibilityDeployed(
  event: EligibilityDeployedEvent,
): void {
  let vaultAddress = event.address;
  let moduleAddress = event.params.eligibilityAddr;

  let vault = getVault(vaultAddress);
  vault.eligibilityModule = moduleAddress.toHexString();
  vault.save();

  let global = getGlobal();
  let eligibilityManagerAddress = global.eligibilityManagerAddress;

  let eligibilityManager = NFTXEligibilityManagerContract.bind(
    changetype<Address>(eligibilityManagerAddress),
  );
  let moduleDataFromInstance = eligibilityManager.try_modules(
    event.params.moduleIndex,
  );

  let module = getEligibilityModule(moduleAddress);

  let instance = EligibilityModuleContract.bind(moduleAddress);
  let finalizedFromInstance = instance.try_finalized();
  let finalized = finalizedFromInstance.reverted
    ? module.finalizedOnDeploy
    : finalizedFromInstance.value;

  if (!moduleDataFromInstance.reverted) {
    let moduleData = moduleDataFromInstance.value;
    module.targetAsset = vault.asset;
    module.name = moduleData.value2;
  }
  module.eligibilityManager = eligibilityManagerAddress;
  module.finalizedOnDeploy = module.finalizedOnDeploy
    ? module.finalizedOnDeploy
    : module.finalized;
  module.finalized = finalized;
  module.save();

  EligibilityModuleTemplate.create(moduleAddress);
}

export function handleVaultShutdown(
  event: VaultShutdownEvent
): void {
  let vault = getVault(event.address);
  vault.shutdownDate = event.block.timestamp;
  vault.totalHoldings = BigInt.fromI32(0);
  vault.save();
}

export function handleMetaDataChange(
  event: MetaDataChangeEvent
): void {
  let token = getToken(event.address);
  token.symbol = event.params.newSymbol;
  token.name = event.params.newName;
  token.save();
}