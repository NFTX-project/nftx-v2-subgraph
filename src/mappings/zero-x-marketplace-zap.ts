import {
  Buy,
  DustReturned,
  Sell,
  Swap
} from "../types/ZeroXMarketplaceZap/ZeroXMarketplaceZap"
import { getMint, getRedeem, getSwap, getZapBuy, getZapSell, getZapSwap } from "./helpers";

export function handleBuy(event: Buy): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let redeem = getRedeem(txHash, logIndex, event.address);
  let zapBuy = getZapBuy(txHash, logIndex);

  zapBuy.ethAmount = event.params.ethSpent;
  zapBuy.vaultAction = redeem.id;
  zapBuy.save();
}


export function handleSell(event: Sell): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let mint = getMint(txHash, logIndex, event.address);
  let zapSell = getZapSell(txHash, logIndex);

  zapSell.ethAmount = event.params.ethReceived;
  zapSell.vaultAction = mint.id;
  zapSell.save();
}

export function handleSwap(event: Swap): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let swap = getSwap(txHash, logIndex, event.address);
  let zapSwap = getZapSwap(txHash, logIndex);

  zapSwap.ethAmount = event.params.ethSpent;
  zapSwap.vaultAction = swap.id;
  zapSwap.save();
}

export function handleDustReturned(event: DustReturned): void {}