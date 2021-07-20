import {
  NFTXStakingZap,
  UserStaked as UserStakedEvent
} from '../types/NFTXStakingZap/NFTXStakingZap';

import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/templates/NFTXLPStaking/NFTXVaultFactoryUpgradeable';

import {
  getStakedLpUser,
  getVault,
  getZap
} from './helpers';

export function handleUserStaked(event: UserStakedEvent): void {
  let lockEndTime = event.params.timelockUntil;
  let vaultId = event.params.vaultId
  let user = getStakedLpUser(event.params.sender);
  user.save();

  let zapInstance = NFTXStakingZap.bind(event.address);
  let vaultFactoryAddress = zapInstance.nftxFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let txHash = event.transaction.hash;
  let zap = getZap(txHash);

  zap.vault = vaultAddress.toHexString();
  zap.user = event.params.sender.toHexString();
  zap.lockEndTime = lockEndTime

  zap.save();
}