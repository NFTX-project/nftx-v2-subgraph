import {
  PoolCreated as PoolCreatedEvent,
  PoolUpdated as PoolUpdatedEvent,
  NFTXLPStaking,
} from '../types/templates/NFTXLPStaking/NFTXLPStaking';
import {
  XTokenCreated as XTokenCreatedEvent,
  Withdraw as WithdrawEvent,
  Deposit as DepositEvent,
  NFTXInventoryStaking
} from '../types/NFTXInventoryStaking/NFTXInventoryStaking';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/templates/NFTXLPStaking/NFTXVaultFactoryUpgradeable';
import { StakingTokenProvider } from '../types/templates/NFTXLPStaking/StakingTokenProvider';
import { getInventoryPool, getInventoryPoolUserActivity, getPool, getStakedIpUser, getToken, getVault } from './helpers';
import { RewardDistributionTokenUpgradeable as RewardDistributionTokenTemplate } from '../types/templates';
import { Address, BigInt } from '@graphprotocol/graph-ts';

function newInventoryPool(
  stakingAddress: Address,
  xTokenAddress: Address,
  vaultId: BigInt
): void {
  let stakingInstance = NFTXInventoryStaking.bind(stakingAddress);
  let vaultFactoryAddress = stakingInstance.nftxVaultFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let pool = getInventoryPool(xTokenAddress);
  let vault = getVault(vaultAddress);
  vault.inventoryStakingPool = pool.id;
  vault.save();

  let rewardToken = getToken(vaultAddress);
  rewardToken.save();
  let dividendToken = getToken(xTokenAddress);
  dividendToken.save();
  let stakingToken = getToken(vaultAddress);
  stakingToken.save();

  pool.rewardToken = rewardToken.id;
  pool.stakingToken = stakingToken.id;
  pool.dividendToken = dividendToken.id;
  pool.vault = vaultAddress.toHexString();
  pool.save();
}

function newPool(
  stakingAddress: Address,
  poolAddress: Address,
  vaultId: BigInt,
  blockNumber: BigInt
): void {
  let stakingInstance = NFTXLPStaking.bind(stakingAddress);
  let vaultFactoryAddress = stakingInstance.nftxVaultFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let stakingTokenProviderAddress = stakingInstance.stakingTokenProvider();
  let stakingTokenProviderInstance = StakingTokenProvider.bind(
    stakingTokenProviderAddress,
  );
  let stakingTokenAddress =
    stakingTokenProviderInstance.stakingTokenForVaultToken(vaultAddress);

  let pool = getPool(poolAddress, blockNumber);
  let vault = getVault(vaultAddress);
  vault.lpStakingPool = pool.id;
  vault.save();

  let rewardToken = getToken(vaultAddress);
  rewardToken.save();
  let dividendToken = getToken(poolAddress);
  dividendToken.save();
  let stakingToken = getToken(stakingTokenAddress);
  stakingToken.save();

  pool.rewardToken = rewardToken.id;
  pool.stakingToken = stakingToken.id;
  pool.dividendToken = dividendToken.id;
  pool.vault = vaultAddress.toHexString();
  pool.save();

  RewardDistributionTokenTemplate.create(poolAddress);
}

export function handleWithdraw(event: WithdrawEvent): void {
  let user = getStakedIpUser(event.params.sender);
  let activity = getInventoryPoolUserActivity(event.params.sender, event.params.vaultId);
  activity.withdrawn = activity.withdrawn.plus(event.params.baseTokenAmount);

  user.save();
  activity.save();
}

export function handleDeposit(event: DepositEvent): void {
  let user = getStakedIpUser(event.params.sender);
  let activity = getInventoryPoolUserActivity(event.params.sender, event.params.vaultId);
  activity.deposited = activity.deposited.plus(event.params.baseTokenAmount);

  user.save();
  activity.save();
}

export function handleXTokenCreated(event: XTokenCreatedEvent): void {
  newInventoryPool(event.address, event.params.xToken, event.params.vaultId)
}

export function handlePoolCreated(event: PoolCreatedEvent): void {
  newPool(event.address, event.params.pool, event.params.vaultId, event.block.number);
}

export function handlePoolUpdated(event: PoolUpdatedEvent): void {
  newPool(event.address, event.params.pool, event.params.vaultId, event.block.number);
}
