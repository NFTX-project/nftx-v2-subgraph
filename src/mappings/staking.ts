import {
  PoolCreated as PoolCreatedEvent,
  PoolUpdated as PoolUpdatedEvent,
  NFTXLPStaking,
  Deposit as LPDepositEvent,
} from '../types/templates/NFTXLPStaking/NFTXLPStaking';
import { RewardDistributionTokenUpgradeable as RewardDistributionToken } from '../types/templates/RewardDistributionTokenUpgradeable/RewardDistributionTokenUpgradeable';
import {
  XTokenCreated as XTokenCreatedEvent,
  NFTXInventoryStaking,
  Withdraw as WithdrawEvent,
  Deposit as DepositEvent,
} from '../types/NFTXInventoryStaking/NFTXInventoryStaking';
import { NFTXVaultFactoryUpgradeable as NFTXVaultFactory } from '../types/templates/NFTXLPStaking/NFTXVaultFactoryUpgradeable';
import { StakingTokenProvider } from '../types/templates/NFTXLPStaking/StakingTokenProvider';
import {
  getDeposit,
  getInventoryPool,
  getPool,
  getStakedLpUser,
  getToken,
  getVault,
  getWithdrawal,
  updatePools,
} from './helpers';
import { RewardDistributionTokenUpgradeable as RewardDistributionTokenTemplate } from '../types/templates';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { VaultToAddressLookup } from '../types/schema';

function newInventoryPool(
  stakingAddress: Address,
  xTokenAddress: Address,
  vaultId: BigInt,
): void {
  let stakingInstance = NFTXInventoryStaking.bind(stakingAddress);
  let vaultFactoryAddress = stakingInstance.nftxVaultFactory();
  let vaultFactoryInstance = NFTXVaultFactory.bind(vaultFactoryAddress);
  let vaultAddress = vaultFactoryInstance.vault(vaultId);

  let pool = getInventoryPool(xTokenAddress);
  let vault = getVault(vaultAddress);
  if(!vault.inventoryStakingPool){
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
}

function newPool(
  stakingAddress: Address,
  poolAddress: Address,
  vaultId: BigInt,
  blockNumber: BigInt,
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

export function handleXTokenCreated(event: XTokenCreatedEvent): void {
  newInventoryPool(event.address, event.params.xToken, event.params.vaultId);
}

export function handlePoolCreated(event: PoolCreatedEvent): void {
  newPool(
    event.address,
    event.params.pool,
    event.params.vaultId,
    event.block.number,
  );
}

export function handlePoolUpdated(event: PoolUpdatedEvent): void {
  newPool(
    event.address,
    event.params.pool,
    event.params.vaultId,
    event.block.number,
  );
}

// Inventory Staking Handlers

export function handleWithdraw(event: WithdrawEvent): void {
  let lookup = VaultToAddressLookup.load(event.params.vaultId.toHexString());
  if (lookup) {
    let vault = getVault(Address.fromBytes(lookup.vaultAddress));
    let stakingPoolAddress = vault.lpStakingPool;
    if (stakingPoolAddress) {
      let poolAddress = Address.fromString(stakingPoolAddress);
      let user = getStakedLpUser(event.params.sender);
      let poolInstance = RewardDistributionToken.bind(poolAddress);
      let balanceFromInstance = poolInstance.try_balanceOf(event.params.sender);
      let balance = balanceFromInstance.reverted
        ? BigInt.fromI32(0)
        : balanceFromInstance.value;

      let withdrawal = getWithdrawal(event.transaction.hash);
      withdrawal.pool = poolAddress.toHexString();
      withdrawal.user = user.id;


      withdrawal.type = "Withdrawal";
      withdrawal.vault = vault.id;

      let txTo = event.transaction.to;
      if(txTo) {
        if(txTo != event.address){
          withdrawal.source = txTo;
        }
      }  

      if (balance == BigInt.fromI32(0)) {
        user = updatePools(user, poolAddress, false);
        user.save();
      }

      withdrawal.withdrawal = event.params.xTokenAmount;
      withdrawal.date = event.block.timestamp;
      withdrawal.save();
    }
  }
}

export function handleDeposit(event: DepositEvent): void {
  let lookup = VaultToAddressLookup.load(event.params.vaultId.toHexString());
  if (lookup) {
    let vault = getVault(Address.fromBytes(lookup.vaultAddress));
    let stakingPoolAddress = vault.lpStakingPool;
    if (stakingPoolAddress) {
      let poolAddress = Address.fromString(stakingPoolAddress);
      let user = getStakedLpUser(event.params.sender);
      let deposit = getDeposit(event.transaction.hash);
      deposit.pool = poolAddress.toHexString();
      deposit.user = user.id;

      deposit.type = "Deposit";
      deposit.vault = vault.id;

      let txTo = event.transaction.to;
      if(txTo) {
        if(txTo != event.address){
          deposit.source = txTo;
        }
      }  
      
      user = updatePools(user, poolAddress, true);
      user.save();

      deposit.deposit = event.params.xTokenAmount;
      deposit.date = event.block.timestamp;
      deposit.save();
    }
  }
}


export function handleLPDeposit(event: LPDepositEvent): void {
      
  let lookup = VaultToAddressLookup.load(event.params.vaultId.toHexString());
  if (lookup) {
    let vault = getVault(Address.fromBytes(lookup.vaultAddress));
    let stakingPoolAddress = vault.lpStakingPool;
    if (stakingPoolAddress) {
      let poolAddress = Address.fromString(stakingPoolAddress);
      let user = getStakedLpUser(event.params.account);
      let deposit = getDeposit(event.transaction.hash);
      deposit.pool = poolAddress.toHexString();
      deposit.user = user.id;

      deposit.type = "LPDeposit";
      deposit.vault = vault.id;

      let txTo = event.transaction.to;
      if(txTo) {
        if(txTo != event.address){
          deposit.source = txTo;
        }
      } 


      user = updatePools(user, poolAddress, true);
      user.save();

      deposit.deposit = event.params.amount;
      deposit.date = event.block.timestamp;
      deposit.save();
    }
  }
}
