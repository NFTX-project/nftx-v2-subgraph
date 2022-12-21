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

export function handleBuyZap(event: BuyZapEvent): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let redeem = getRedeem(txHash, logIndex);
  let zapBuy = getZapBuy(txHash, logIndex);

  zapBuy.ethAmount = event.params.ethSpent;
  zapBuy.vaultAction = redeem.id;
  zapBuy.save();
}

export function handleSellZap(event: SellZapEvent): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let mint = getMint(txHash, logIndex);
  let zapSell = getZapSell(txHash, logIndex);

  zapSell.ethAmount = event.params.ethReceived;
  zapSell.vaultAction = mint.id;
  zapSell.save();
}

export function handleSwapZap(event: SwapZapEvent): void {
  let txHash = event.transaction.hash;
  let logIndex = event.logIndex;
  let swap = getSwap(txHash, logIndex);
  let zapSwap = getZapSwap(txHash, logIndex);

  zapSwap.ethAmount = event.params.ethSpent;
  zapSwap.vaultAction = swap.id;
  zapSwap.save();
}