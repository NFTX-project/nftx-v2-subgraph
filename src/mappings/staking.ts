import {
  PoolCreated as PoolCreatedEvent,
  PoolUpdated as PoolUpdatedEvent,
  FeesReceived as FeesReceivedEvent,
  NFTXLPStaking,
} from '../types/NFTXLPStaking/NFTXLPStaking';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/NFTXLPStaking/NFTXVaultFactoryUpgradeable';
import { StakingTokenProvider } from '../types/NFTXLPStaking/StakingTokenProvider';
import { getPool, getToken } from './helpers';

export function handlePoolCreated(event: PoolCreatedEvent): void {
  // let poolAddress = event.params.pool;
  // let vaultId = event.params.vaultId;

  // let stakingInstance = NFTXLPStaking.bind(event.address);
  // let vaultFactoryAddress = stakingInstance.nftxVaultFactory();
  // let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  // let vaultAddress = vaultFactoryInstance.vault(vaultId);

  // let stakingTokenProviderAddress = stakingInstance.stakingTokenProvider();
  // let stakingTokenProviderInstance = StakingTokenProvider.bind(
  //   stakingTokenProviderAddress,
  // );
  // let stakingTokenAddress =
  //   stakingTokenProviderInstance.stakingTokenForVaultToken(vaultAddress);

  // let pool = getPool(vaultAddress);

  // let rewardToken = getToken(vaultAddress);
  // rewardToken.save();
  // let dividendToken = getToken(poolAddress);
  // dividendToken.save();
  // let stakingToken = getToken(stakingTokenAddress);
  // stakingToken.save();

  // pool.rewardToken = rewardToken.id;
  // pool.stakingToken = stakingToken.id;
  // pool.dividendToken = dividendToken.id;
  // pool.vault = vaultAddress.toHexString();
  // pool.save();
}

export function handlePoolUpdated(event: PoolUpdatedEvent): void {
  // let poolAddress = event.params.pool;
  // let vaultId = event.params.vaultId;

  // let stakingInstance = NFTXLPStaking.bind(event.address);
  // let vaultFactoryAddress = stakingInstance.nftxVaultFactory();
  // let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  // let vaultAddress = vaultFactoryInstance.vault(vaultId);

  // let stakingTokenProviderAddress = stakingInstance.stakingTokenProvider();
  // let stakingTokenProviderInstance = StakingTokenProvider.bind(
  //   stakingTokenProviderAddress,
  // );
  // let stakingTokenAddress =
  //   stakingTokenProviderInstance.stakingTokenForVaultToken(vaultAddress);

  // let pool = getPool(vaultAddress);

  // let rewardToken = getToken(vaultAddress);
  // rewardToken.save();
  // let dividendToken = getToken(poolAddress);
  // dividendToken.save();
  // let stakingToken = getToken(stakingTokenAddress);
  // stakingToken.save();

  // pool.rewardToken = rewardToken.id;
  // pool.stakingToken = stakingToken.id;
  // pool.dividendToken = dividendToken.id;
  // pool.vault = vaultAddress.toHexString();
  // pool.save();
}

export function handleFeesReceived(event: FeesReceivedEvent): void {
  // let amount = event.params.amount;
  // let vaultId = event.params.vaultId;

  // let stakingInstance = NFTXLPStaking.bind(event.address);
  // let vaultFactoryAddress = stakingInstance.nftxVaultFactory();
  // let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  // let vaultAddress = vaultFactoryInstance.vault(vaultId);

  // let pool = getPool(vaultAddress);

  // pool.totalRewards = pool.totalRewards.plus(amount);
  // pool.save();
}
