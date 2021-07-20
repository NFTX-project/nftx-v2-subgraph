import {
  NFTXStakingZap,
  UserStaked as UserStakedEvent
} from '../types/NFTXStakingZap/NFTXStakingZap';

import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/templates/NFTXLPStaking/NFTXVaultFactoryUpgradeable';

import {
  getZap
} from './helpers';

export function handleUserStaked(event: UserStakedEvent): void {
  let lockEndTime = event.params.timelockUntil;

  let txHash = event.transaction.hash;
  let zap = getZap(txHash);

  zap.vault = "0xdea9196dcdd2173d6e369c2acc0facc83fd9346a";
  zap.user = event.params.sender.toHexString();
  zap.lockEndTime = lockEndTime

  zap.save();
}