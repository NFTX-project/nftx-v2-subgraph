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
  let vault = getVault(vaultAddress);
  vault.save();

  let zap = getZap(vaultId, event.params.sender, event.address);

  zap.vault = vault.id;
  zap.user = user.id;
  zap.amount = zap.amount.plus(event.params.lpBalance);
  zap.lockEndTime = lockEndTime

  zap.save();
}