import {
  Buy as BuyZapEvent,
  Sell as SellZapEvent,
  Swap as SwapZapEvent
} from '../types/NFTXMarketplaceZap/NFTXMarketplaceZap';
import { Minted } from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultUpgradeable';

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
  let redeem = getRedeem(txHash);
  let zapBuy = getZapBuy(txHash);

  redeem.type = "ZapBuy";
  redeem.save();

  zapBuy.ethAmount = event.params.ethSpent;
  zapBuy.vaultAction = redeem.id;
  zapBuy.save();
}

export function handleSellZap(event: SellZapEvent): void {
  let txHash = event.transaction.hash;
  let mint = getMint(txHash);
  let zapSell = getZapSell(txHash);

  mint.type = "ZapSell";
  mint.save();

  zapSell.ethAmount = event.params.ethReceived;
  zapSell.vaultAction = mint.id;
  zapSell.save();
}

export function handleSwapZap(event: SwapZapEvent): void {
  let txHash = event.transaction.hash;
  let swap = getSwap(txHash);
  let zapSwap = getZapSwap(txHash);

  swap.type = "ZapSwap";
  swap.save();

  zapSwap.ethAmount = event.params.ethSpent;
  zapSwap.vaultAction = swap.id;
  zapSwap.save();
}