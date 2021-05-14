import { Vault } from '../types/schema';
import { NewVault as NewVaultEvent } from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultFactoryUpgradeable';
import { NFTXVaultUpgradeable as NFTXVault } from '../types/NFTXVaultFactoryUpgradeable/NFTXVaultUpgradeable';
import { getGlobal, getAsset, getToken, getManager } from './helpers';
import { ADDRESS_ZERO } from './constants';
import { log } from '@graphprotocol/graph-ts';

export function handleNewVault(event: NewVaultEvent): void {
  let global = getGlobal();
  global.nftxVaultFactory = event.address;
  let vaultAddress = event.params.vaultAddress;
  log.info('new vault {}', [vaultAddress.toHexString()]);

  let vault = new Vault(vaultAddress.toHexString());
  let vaultInstance = NFTXVault.bind(vaultAddress);
  vault.vaultId = event.params.vaultId;
  vault.is1155 = vaultInstance.is1155();
  vault.allowAllItems = vaultInstance.allowAllItems();

  let token = getToken(vaultAddress);
  vault.token = token.id;
  token.save();

  let asset = getAsset(event.params.assetAddress);
  vault.asset = asset.id;
  let assetVaults = asset.vaults;
  assetVaults.push(vault.id);
  asset.vaults = assetVaults;
  asset.save();

  let managerAddress = vaultInstance.manager();
  let manager = getManager(managerAddress);
  vault.manager = manager.id;
  vault.isFinalized = manager.id == ADDRESS_ZERO.toHexString();
  let managerVaults = manager.vaults;
  managerVaults.push(vault.id);
  manager.vaults = managerVaults;
  manager.save();

  vault.save();
}
