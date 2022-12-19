import { BigInt } from "@graphprotocol/graph-ts"
import {
  ZeroXMarketplaceZap,
  Buy,
  DustReturned,
  OwnershipTransferred,
  Sell,
  Swap
} from "../types/ZeroXMarketplaceZap/ZeroXMarketplaceZap"

export function handleBuy(event: Buy): void {
}

export function handleDustReturned(event: DustReturned): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSell(event: Sell): void {}

export function handleSwap(event: Swap): void {}
