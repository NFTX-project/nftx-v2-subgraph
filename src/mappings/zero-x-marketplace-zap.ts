import {
  Buy,
  DustReturned,
  Sell,
  Swap
} from "../types/ZeroXMarketplaceZap/ZeroXMarketplaceZap"
import { createDustReturned, getDustReturned, getMint, getRedeem, getSwap, getUser, getZapBuy, getZapSell, getZapSwap } from "./helpers";

export function handleBuy(event: Buy): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let redeem = getRedeem(txHash, event.address);
  let zapBuy = getZapBuy(txHash);

  zapBuy.ethAmount = event.params.ethSpent;
  zapBuy.vaultAction = redeem.id;
  zapBuy.save();

  createDustReturned(txHash, "REDEEM");
}


export function handleSell(event: Sell): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let mint = getMint(txHash, event.address);
  let zapSell = getZapSell(txHash);

  zapSell.ethAmount = event.params.ethReceived;
  zapSell.vaultAction = mint.id;
  zapSell.save();

  createDustReturned(txHash, "MINT");
}

export function handleSwap(event: Swap): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let swap = getSwap(txHash, event.address);
  let zapSwap = getZapSwap(txHash);

  zapSwap.ethAmount = event.params.ethSpent;
  zapSwap.vaultAction = swap.id;
  zapSwap.save();

  createDustReturned(txHash, "SWAP");
}

export function handleDustReturned(event: DustReturned): void {
  let txHash = event.transaction.hash;
  let dustReturned = getDustReturned(txHash);
  if(dustReturned){
    dustReturned.ethAmount = event.params.ethAmount;
    dustReturned.vTokenAmount = event.params.vTokenAmount;
    dustReturned.to = getUser(event.params.to).id;
    dustReturned.save();
  }
}