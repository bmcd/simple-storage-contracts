// SPDX-License-Identifier: MIT

// solhint-disable-next-line compiler-version
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

/**
 * This is a simple version of an 'initializer' to tbe used when upgrading a contract.
 * DO NOT USE THIS IN PRODUCTION, IT IS A NAIVE IMPLEMENTATION AND PROOF OF CONCEPT
 */
abstract contract Migratable2 {

    /**
 * @dev Storage slot with the address of the current 'migrated' flag.
 */
    bytes32 internal constant MIGRATED2_SLOT = keccak256("migrated2");

    /**
     * @dev Storage slot with the address of the current 'migrating' flag.
     */
    bytes32 internal constant MIGRATING2_SLOT = keccak256("migrating2");

    /**
   * @dev Returns the current migrated flag.
   * return bool migrated value of the migrated flag
   */
    function _migrated2() internal view returns (bool migrated) {
        bytes32 slot = MIGRATED2_SLOT;
        assembly {
            migrated := sload(slot)
        }
    }

    /**
     * @dev Sets the migrated flag.
     * @param newMigrated Boolean value of the migrated flag.
     */
    function _setMigrated2(bool newMigrated) internal {
        bytes32 slot = MIGRATED2_SLOT;
        assembly {
            sstore(slot, newMigrated)
        }
    }

    /**
     * @dev Returns the current migrating flag.
     * return bool migrating
     */
    function _migrating2() internal view returns (bool migrating) {
        bytes32 slot = MIGRATING2_SLOT;
        assembly {
            migrating := sload(slot)
        }
    }

    /**
     * @dev Sets the migrating flag.
     * @param newMigrating Boolean value of the migrating flag.
     */
    function _setMigrating2(bool newMigrating) internal {
        bytes32 slot = MIGRATING2_SLOT;
        assembly {
            sstore(slot, newMigrating)
        }
    }


    /**
     * @dev Modifier to protect an migrater function from being invoked twice.
     */
    modifier migrater2() {
        require(_migrating2() || !_migrated2(), "Migratable2: contract is already migrated");

        bool isTopLevelCall = !_migrating2();
        if (isTopLevelCall) {
            _setMigrating2(true);
            _setMigrated2(true);
        }

        _;

        if (isTopLevelCall) {
            _setMigrating2(false);
        }
    }
}
