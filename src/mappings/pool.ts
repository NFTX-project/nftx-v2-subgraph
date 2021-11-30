import {
  Transfer as TransferEvent,
  RewardWithdrawn as RewardWithdrawnEvent,
  RewardDistributionTokenUpgradeable as RewardDistributionToken,
} from '../types/templates/RewardDistributionTokenUpgradeable/RewardDistributionTokenUpgradeable';
import {
  getReward,
  getStakedLpUser,
  getPool,
  updatePools,
  getDeposit,
  getToken,
  getWithdrawal,
} from './helpers';
import { ADDRESS_ZERO } from './constants';
import { Address, BigInt } from '@graphprotocol/graph-ts';

export function handleRewardWithdrawn(event: RewardWithdrawnEvent): void {
  let poolAddress = event.address;
  let pool = getPool(poolAddress, event.block.number);

  let txHash = event.transaction.hash;
  let userAddress = event.params.to;
  let amount = event.params.weiAmount;

  let user = getStakedLpUser(userAddress);
  user.save();

  let rewards = getReward(txHash);
  rewards.date = event.block.timestamp;
  rewards.pool = pool.id;
  rewards.reward = amount;
  rewards.user = user.id;
  rewards.save();

  pool.totalRewards = pool.totalRewards.plus(amount);

  getToken(
    Address.fromHexString(pool.rewardToken) as Address,
  );

  getToken(
    Address.fromHexString(pool.stakingToken) as Address,
  );

  getToken(poolAddress);

  pool.save();
}

export function handleTransfer(event: TransferEvent): void {
  let poolAddress = event.address;
  let pool = getPool(poolAddress, event.block.number);

  let txHash = event.transaction.hash;
  let amount = event.params.value;

  if (event.params.from == ADDRESS_ZERO) {
    let userAddress = event.params.to;
    let user = getStakedLpUser(userAddress);
    let deposit = getDeposit(txHash);
    deposit.pool = pool.id;
    deposit.user = user.id;

    user = updatePools(user, poolAddress, true);
    user.save();

    deposit.deposit = amount;
    deposit.date = event.block.timestamp;
    deposit.save();
  } else if (event.params.to == ADDRESS_ZERO) {
    let userAddress = event.params.from;
    let user = getStakedLpUser(userAddress);
    let poolInstance = RewardDistributionToken.bind(poolAddress);
    // TODO: This eth-call could be avoided by keeping track of the balance in the database
    let balanceFromInstance = poolInstance.try_balanceOf(userAddress);
    let balance = balanceFromInstance.reverted
      ? BigInt.fromI32(0)
      : balanceFromInstance.value;

    let withdrawal = getWithdrawal(txHash);
    withdrawal.pool = pool.id;
    withdrawal.user = user.id;

    if (balance == BigInt.fromI32(0)) {
      user = updatePools(user, poolAddress, false);
      user.save();
    }

    withdrawal.withdrawal = amount;
    withdrawal.date = event.block.timestamp;
    withdrawal.save();
  } else {
    let fromUser = getStakedLpUser(event.params.from);
    let poolInstance = RewardDistributionToken.bind(poolAddress);
    let balanceFromInstance = poolInstance.try_balanceOf(event.params.from);
    let balance = balanceFromInstance.reverted
      ? BigInt.fromI32(0)
      : balanceFromInstance.value;

    if (balance == BigInt.fromI32(0)) {
      fromUser = updatePools(fromUser, poolAddress, false);
      fromUser.save();
    }

    let toUser = getStakedLpUser(event.params.to);
    toUser = updatePools(toUser, poolAddress, true);
    toUser.save();
  }

  let rewardToken = getToken(
    Address.fromHexString(pool.rewardToken) as Address,
  );
  rewardToken.save();

  let stakingToken = getToken(
    Address.fromHexString(pool.stakingToken) as Address,
  );
  stakingToken.save();

  let dividendToken = getToken(poolAddress);
  dividendToken.save();
}
