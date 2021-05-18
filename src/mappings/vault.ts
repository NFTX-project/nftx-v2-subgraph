import {
  Transfer as TransferEvent,
  Minted as MintEvent,
  Redeemed as RedeemEvent,
  ManagerSet as ManagerSetEvent,
  EnableMintUpdated as EnableMintUpdatedEvent,
  EnableRedeemUpdated as EnableRandomRedeemUpdatedEvent, // TODO: change this to Random
  EnableDirectRedeemUpdated as EnableDirectRedeemUpdatedEvent,
  EnableSwapUpdated as EnableSwapUpdatedEvent,
  MintFeeUpdated as MintFeeUpdatedEvent,
  RedeemFeeUpdated as RedeemFeeUpdatedEvent, // TODO: change this to Random and Target
} from '../types/NFTXVaultUpgradeable/NFTXVaultUpgradeable';
import {
  getGlobal,
  getVault,
  getFeeReceipt,
  getMint,
  getUser,
  getRedeem,
  updateManager,
  updateHoldings,
  getFeatures,
  getFees,
  getSpecificIds,
} from './helpers';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleTransfer(event: TransferEvent): void {
  let global = getGlobal();
  let vaultAddress = event.address;
  if (event.params.from == global.feeDistributorAddress) {
    let feeReceipt = getFeeReceipt(event.transaction.hash);
    feeReceipt.vault = vaultAddress.toHexString();
    feeReceipt.token = vaultAddress.toHexString();
    feeReceipt.amount = event.params.value;
    feeReceipt.save();

    let vault = getVault(vaultAddress);
    vault.totalFees = vault.totalFees.plus(event.params.value);
    vault.save();
  }
}

export function handleMint(event: MintEvent): void {
  let vaultAddress = event.address;

  let txHash = event.transaction.hash;
  let mint = getMint(txHash);
  let user = getUser(event.params.sender);
  mint.user = user.id;
  mint.vault = vaultAddress.toHexString();
  mint.date = event.block.timestamp;
  mint.nftIds = event.params.nftIds;
  mint.amounts = event.params.amounts;

  mint.save();
  user.save();

  let vault = getVault(vaultAddress);
  updateHoldings(vault, event.params.nftIds);
  vault.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let vaultAddress = event.address;

  let txHash = event.transaction.hash;
  let redeem = getRedeem(txHash);
  let nftIds = event.params.nftIds;
  let specificIds = getSpecificIds(event.transaction.input);
  let user = getUser(event.params.sender);

  redeem.user = user.id;
  redeem.vault = vaultAddress.toHexString();
  redeem.date = event.block.timestamp;
  redeem.nftIds = nftIds;
  redeem.specificIds = specificIds;
  redeem.directCount = BigInt.fromI32(specificIds.length);
  redeem.randomCount = BigInt.fromI32(nftIds.length - specificIds.length);

  redeem.save();
  user.save();

  let vault = getVault(vaultAddress);
  updateHoldings(vault, event.params.nftIds, false);
  vault.save();
}

export function handleManagerSet(event: ManagerSetEvent): void {
  let managerAddress = event.params.manager;
  let vault = getVault(event.address);
  updateManager(vault, managerAddress);
  vault.save();
}

export function handleEnableMintUpdated(event: EnableMintUpdatedEvent): void {
  let features = getFeatures(event.address);
  features.enableMint = event.params.enabled;
  features.save();
}

export function handleEnableRandomRedeemUpdated(
  event: EnableRandomRedeemUpdatedEvent,
): void {
  let features = getFeatures(event.address);
  features.enableRandomRedeem = event.params.enabled;
  features.save();
}

export function handleEnableDirectRedeemUpdated(
  event: EnableDirectRedeemUpdatedEvent,
): void {
  let features = getFeatures(event.address);
  features.enableDirectRedeem = event.params.enabled;
  features.save();
}

export function handleEnableSwapUpdated(event: EnableSwapUpdatedEvent): void {
  let features = getFeatures(event.address);
  features.enableSwap = event.params.enabled;
  features.save();
}

export function handleMintFeeUpdated(event: MintFeeUpdatedEvent): void {
  let fees = getFees(event.address);
  fees.mintFee = event.params.mintFee;
  fees.save();
}

export function handleRedeemFeeUpdated(event: RedeemFeeUpdatedEvent): void {
  // TODO: change this to Random and Target
  let fees = getFees(event.address);
  fees.randomRedeemFee = event.params.redeemFee;
  fees.directRedeemFee = event.params.redeemFee;
  fees.save();
}
