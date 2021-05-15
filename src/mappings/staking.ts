import {
  PoolCreated as PoolCreatedEvent,
  PoolUpdated as PoolUpdatedEvent,
  NFTXLPStaking,
} from '../types/NFTXLPStaking/NFTXLPStaking';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/NFTXLPStaking/NFTXVaultFactoryUpgradeable';
import { StakingTokenProvider } from '../types/NFTXLPStaking/StakingTokenProvider';
import { getPool, getToken } from './helpers';
import { RewardDistributionTokenUpgradeable as PoolToken } from '../types/templates';
import { Address, BigInt } from '@graphprotocol/graph-ts';

function newPool(
  stakingAddress: Address,
  poolAddress: Address,
  vaultId: BigInt,
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

  let pool = getPool(poolAddress);

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

  PoolToken.create(poolAddress);
}

export function handlePoolCreated(event: PoolCreatedEvent): void {
  newPool(event.address, event.params.pool, event.params.vaultId);
}

export function handlePoolUpdated(event: PoolUpdatedEvent): void {
  newPool(event.address, event.params.pool, event.params.vaultId);
}
