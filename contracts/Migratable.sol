// SPDX-License-Identifier: MIT

// solhint-disable-next-line compiler-version
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

/**
 * This is a simple version of an 'initializer' to tbe used when upgrading a contract.
 * DO NOT USE THIS IN PRODUCTION, IT IS A NAIVE IMPLEMENTATION AND PROOF OF CONCEPT
 */
abstract contract Migratable {

    /**
 * @dev Storage slot with the address of the current 'migrated' flag.
 * This is the keccak-256 hash of "zos.initializable.initialized" subtracted by 1
 */
    bytes32 internal constant MIGRATED_SLOT = 0x7d7a37a9c9b8bd172dd5856df5c42095640bb8f663c76d7af29583ec5121dac4;

    /**
     * @dev Storage slot with the address of the current 'migrating' flag.
     * This is the keccak-256 hash of "zos.initializable.initializing" subtracted by 1
     */
    bytes32 internal constant MIGRATING_SLOT = 0x1962c92ddb644cf68d2aa115edb30dc5f942367eaf370acead3c212ed8ea3439;

    /**
   * @dev Returns the current migrated flag.
   * return bool migrated value of the migrated flag
   */
    function _migrated() internal view returns (bool migrated) {
        bytes32 slot = MIGRATED_SLOT;
        assembly {
            migrated := sload(slot)
        }
    }

    /**
     * @dev Sets the migrated flag.
     * @param newMigrated Boolean value of the migrated flag.
     */
    function _setMigrated(bool newMigrated) internal {
        bytes32 slot = MIGRATED_SLOT;
        assembly {
            sstore(slot, newMigrated)
        }
    }

    /**
     * @dev Returns the current migrating flag.
     * return bool migrating
     */
    function _migrating() internal view returns (bool migrating) {
        bytes32 slot = MIGRATING_SLOT;
        assembly {
            migrating := sload(slot)
        }
    }

    /**
     * @dev Sets the migrating flag.
     * @param newMigrating Boolean value of the migrating flag.
     */
    function _setMigrating(bool newMigrating) internal {
        bytes32 slot = MIGRATING_SLOT;
        assembly {
            sstore(slot, newMigrating)
        }
    }


    /**
     * @dev Modifier to protect an migrater function from being invoked twice.
     */
    modifier migrater() {
        require(_migrating() || !_migrated(), "Migratable: contract is already migrated");

        bool isTopLevelCall = !_migrating();
        if (isTopLevelCall) {
            _setMigrating(true);
            _setMigrated(true);
        }

        _;

        if (isTopLevelCall) {
            _setMigrating(false);
        }
    }
}
