import {
  Transfer as TransferEvent,
  Minted as MintEvent,
  Redeemed as RedeemEvent,
} from '../types/NFTXVaultUpgradeable/NFTXVaultUpgradeable';
import {
  getGlobal,
  getVault,
  getFeeReceipt,
  getMint,
  getUser,
  getRedeem,
  updateHoldings,
} from './helpers';

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
  updateHoldings(vault, event.params.nftIds)
  vault.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let vaultAddress = event.address;

  let txHash = event.transaction.hash;
  let redeem = getRedeem(txHash);
  let user = getUser(event.params.sender);
  redeem.user = user.id;
  redeem.vault = vaultAddress.toHexString();
  redeem.date = event.block.timestamp;
  redeem.nftIds = event.params.nftIds;

  redeem.save();
  user.save();

  let vault = getVault(vaultAddress);
  updateHoldings(vault, event.params.nftIds, false)
  vault.save();
}
