import {
  ModuleAdded as ModuleAddedEvent,
  ModuleUpdated as ModuleUpdatedEvent,
} from '../types/templates/NFTXEligibilityManager/NFTXEligibilityManager';

import { EligibilityModule as EligibilityModuleTemplate } from '../types/templates';

import {
  UniqueEligibilitiesSet as UniqueEligibilitiesSetEvent,
  RangeSet as RangeSetEvent,
  EligibilityModule as EligibilityModuleContract,
} from '../types/templates/EligibilityModule/EligibilityModule';

import { getEligibilityModule, updateEligibleTokenIds } from './helpers';
import { ADDRESS_ZERO } from './constants';

export function handleModuleAdded(event: ModuleAddedEvent): void {
  let managerAddress = event.address;
  let moduleAddress = event.params.implementation;

  let module = getEligibilityModule(moduleAddress);
  module.eligibilityManager = managerAddress;
  module.name = event.params.name;
  module.targetAsset = event.params.targetAsset.toHexString();
  module.finalized = event.params.finalizedOnDeploy;
  module.finalizedOnDeploy = event.params.finalizedOnDeploy;
  module.save();

  EligibilityModuleTemplate.create(moduleAddress);
}

export function handleModuleUpdated(event: ModuleUpdatedEvent): void {
  let managerAddress = event.address;
  let moduleAddress = event.params.implementation;

  let module = getEligibilityModule(moduleAddress);
  module.eligibilityManager = managerAddress;
  module.name = event.params.name;
  module.finalized = event.params.finalizedOnDeploy;
  module.finalizedOnDeploy = event.params.finalizedOnDeploy;

  let instance = EligibilityModuleContract.bind(moduleAddress);
  let targetAssetFromInstance = instance.try_targetAsset();
  let targetAsset = targetAssetFromInstance.reverted
    ? ADDRESS_ZERO
    : targetAssetFromInstance.value;

  module.targetAsset = targetAsset.toHexString();
  module.save();

  EligibilityModuleTemplate.create(moduleAddress);
}

export function handleUniqueEligibilitiesSet(
  event: UniqueEligibilitiesSetEvent,
): void {
  let moduleAddress = event.address;
  let module = getEligibilityModule(moduleAddress);

  let instance = EligibilityModuleContract.bind(moduleAddress);
  let finalizedFromInstance = instance.try_finalized();
  let finalized = finalizedFromInstance.reverted
    ? module.finalizedOnDeploy
    : finalizedFromInstance.value;

  module.finalized = finalized;

  module = updateEligibleTokenIds(
    module,
    event.params.tokenIds,
    event.params.isEligible,
  );

  module.save();
}

export function handleRangeSet(event: RangeSetEvent): void {
  let moduleAddress = event.address;
  let module = getEligibilityModule(moduleAddress);

  let instance = EligibilityModuleContract.bind(moduleAddress);
  let finalizedFromInstance = instance.try_finalized();
  let finalized = finalizedFromInstance.reverted
    ? module.finalizedOnDeploy
    : finalizedFromInstance.value;

  module.finalized = finalized;

  module.eligibleRange = [event.params.rangeStart, event.params.rangeEnd];

  module.save();
}
