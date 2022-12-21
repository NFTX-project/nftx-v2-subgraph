import { BigInt } from "@graphprotocol/graph-ts"
import {
  ZeroXMarketplaceZap,
  Buy,
  DustReturned,
  OwnershipTransferred,
  Sell,
  Swap
} from "../types/ZeroXMarketplaceZap/ZeroXMarketplaceZap"
import { getMint, getRedeem, getSwap, getZapBuy, getZapSell, getZapSwap } from "./helpers";

export function handleBuy(event: Buy): void {
  let txHash = event.transaction.hash;
  let redeem = getRedeem(txHash, event.address);
  let zapBuy = getZapBuy(txHash);

  zapBuy.ethAmount = event.params.ethSpent;
  zapBuy.vaultAction = redeem.id;
  zapBuy.save();
}


export function handleSell(event: Sell): void {
  let txHash = event.transaction.hash;
  let mint = getMint(txHash, event.address);
  let zapSell = getZapSell(txHash);

  zapSell.ethAmount = event.params.ethReceived;
  zapSell.vaultAction = mint.id;
  zapSell.save();
}

export function handleSwap(event: Swap): void {
  let txHash = event.transaction.hash;
  let swap = getSwap(txHash, event.address);
  let zapSwap = getZapSwap(txHash);

  zapSwap.ethAmount = event.params.ethSpent;
  zapSwap.vaultAction = swap.id;
  zapSwap.save();
}
