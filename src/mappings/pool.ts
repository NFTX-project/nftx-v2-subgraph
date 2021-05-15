import { RewardWithdrawn as RewardWithdrawnEvent } from '../types/templates/RewardDistributionTokenUpgradeable/RewardDistributionTokenUpgradeable';
import { getRewards, getStakedLpUser, getPool, updatePools } from './helpers';

export function handleRewardWithdrawn(event: RewardWithdrawnEvent): void {
  let poolAddress = event.address;
  let pool = getPool(poolAddress);

  let txHash = event.transaction.hash;
  let userAddress = event.params.to;
  let amount = event.params.weiAmount;

  let rewards = getRewards(txHash);
  rewards.date = event.block.timestamp;
  rewards.pool = pool.id;
  rewards.reward = amount;
  rewards.save();

  let user = getStakedLpUser(userAddress);
  updatePools(user, poolAddress);
  let userRewards = user.userRewards;
  userRewards.push(rewards.id);
  user.userRewards = userRewards;
  user.save();

  pool.totalRewards = pool.totalRewards.plus(amount);
  pool.save();
}
