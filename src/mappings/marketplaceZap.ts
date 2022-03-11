import {
  Buy as BuyZapEvent,
  Sell as SellZapEvent,
  Swap as SwapZapEvent
} from '../types/NFTXMarketplaceZap/NFTXMarketplaceZap';

import {
  getSwap,
  getMint,
  getRedeem,
  getZapBuy,
  getZapSell,
  getZapSwap
} from './helpers';

export function handleBuy(event: BuyZapEvent): void {
  let txHash = event.transaction.hash;
  let redeem = getRedeem(txHash);
  let zapBuy = getZapBuy(txHash);

  zapBuy.ethAmount = event.params.ethSpent;
  zapBuy.vaultAction = redeem.id;
  zapBuy.save();

  redeem.vaultInteraction = false;
  redeem.save();
}

export function handleSell(event: SellZapEvent): void {
  let txHash = event.transaction.hash;
  let mint = getMint(txHash);
  let zapSell = getZapSell(txHash);

  zapSell.ethAmount = event.params.ethReceived;
  zapSell.vaultAction = mint.id;
  zapSell.save();

  mint.vaultInteraction = false;
  mint.save();
}

export function handleSwap(event: SwapZapEvent): void {
  let txHash = event.transaction.hash;
  let swap = getSwap(txHash);
  let zapSwap = getZapSwap(txHash);

  zapSwap.ethAmount = event.params.ethSpent;
  zapSwap.vaultAction = swap.id;
  zapSwap.save();

  swap.vaultInteraction = false;
  swap.save();
}