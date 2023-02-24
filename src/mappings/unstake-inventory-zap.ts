import {
  InventoryUnstaked
} from '../types/NFTXUnstakingInventoryZap/NFTXUnstakingInventoryZap';
import { getRedeem, getWithdrawal } from './helpers';

export function handleInventoryUnstaked(event: InventoryUnstaked): void {
  let withdrawal = getWithdrawal(event.transaction.hash);
  if(withdrawal) {
    withdrawal.type = "UnstakeInventory";
    withdrawal.save();
  }
  let redeem = getRedeem(event.transaction.hash);
  if(redeem) {
    redeem.type = "UnstakeInventory";
    redeem.save();
  }
}