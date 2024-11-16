export const GPv2Settlement = [
    {
        inputs: [
            { internalType: 'contract GPv2Authentication', name: 'authenticator_', type: 'address' },
            { internalType: 'contract IVault', name: 'vault_', type: 'address' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'target', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
            { indexed: false, internalType: 'bytes4', name: 'selector', type: 'bytes4' },
        ],
        name: 'Interaction',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
            { indexed: false, internalType: 'bytes', name: 'orderUid', type: 'bytes' },
        ],
        name: 'OrderInvalidated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
            { indexed: false, internalType: 'bytes', name: 'orderUid', type: 'bytes' },
            { indexed: false, internalType: 'bool', name: 'signed', type: 'bool' },
        ],
        name: 'PreSignature',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: 'address', name: 'solver', type: 'address' }],
        name: 'Settlement',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
            { indexed: false, internalType: 'contract IERC20', name: 'sellToken', type: 'address' },
            { indexed: false, internalType: 'contract IERC20', name: 'buyToken', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'sellAmount', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'buyAmount', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
            { indexed: false, internalType: 'bytes', name: 'orderUid', type: 'bytes' },
        ],
        name: 'Trade',
        type: 'event',
    },
    {
        inputs: [],
        name: 'authenticator',
        outputs: [{ internalType: 'contract GPv2Authentication', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'domainSeparator',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
        name: 'filledAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes[]', name: 'orderUids', type: 'bytes[]' }],
        name: 'freeFilledAmountStorage',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes[]', name: 'orderUids', type: 'bytes[]' }],
        name: 'freePreSignatureStorage',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'offset', type: 'uint256' },
            { internalType: 'uint256', name: 'length', type: 'uint256' },
        ],
        name: 'getStorageAt',
        outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes', name: 'orderUid', type: 'bytes' }],
        name: 'invalidateOrder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
        name: 'preSignature',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes', name: 'orderUid', type: 'bytes' },
            { internalType: 'bool', name: 'signed', type: 'bool' },
        ],
        name: 'setPreSignature',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'contract IERC20[]', name: 'tokens', type: 'address[]' },
            { internalType: 'uint256[]', name: 'clearingPrices', type: 'uint256[]' },
            {
                components: [
                    { internalType: 'uint256', name: 'sellTokenIndex', type: 'uint256' },
                    { internalType: 'uint256', name: 'buyTokenIndex', type: 'uint256' },
                    { internalType: 'address', name: 'receiver', type: 'address' },
                    { internalType: 'uint256', name: 'sellAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'buyAmount', type: 'uint256' },
                    { internalType: 'uint32', name: 'validTo', type: 'uint32' },
                    { internalType: 'bytes32', name: 'appData', type: 'bytes32' },
                    { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'flags', type: 'uint256' },
                    { internalType: 'uint256', name: 'executedAmount', type: 'uint256' },
                    { internalType: 'bytes', name: 'signature', type: 'bytes' },
                ],
                internalType: 'struct GPv2Trade.Data[]',
                name: 'trades',
                type: 'tuple[]',
            },
            {
                components: [
                    { internalType: 'address', name: 'target', type: 'address' },
                    { internalType: 'uint256', name: 'value', type: 'uint256' },
                    { internalType: 'bytes', name: 'callData', type: 'bytes' },
                ],
                internalType: 'struct GPv2Interaction.Data[][3]',
                name: 'interactions',
                type: 'tuple[][3]',
            },
        ],
        name: 'settle',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'targetContract', type: 'address' },
            { internalType: 'bytes', name: 'calldataPayload', type: 'bytes' },
        ],
        name: 'simulateDelegatecall',
        outputs: [{ internalType: 'bytes', name: 'response', type: 'bytes' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'targetContract', type: 'address' },
            { internalType: 'bytes', name: 'calldataPayload', type: 'bytes' },
        ],
        name: 'simulateDelegatecallInternal',
        outputs: [{ internalType: 'bytes', name: 'response', type: 'bytes' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'bytes32', name: 'poolId', type: 'bytes32' },
                    { internalType: 'uint256', name: 'assetInIndex', type: 'uint256' },
                    { internalType: 'uint256', name: 'assetOutIndex', type: 'uint256' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'bytes', name: 'userData', type: 'bytes' },
                ],
                internalType: 'struct IVault.BatchSwapStep[]',
                name: 'swaps',
                type: 'tuple[]',
            },
            { internalType: 'contract IERC20[]', name: 'tokens', type: 'address[]' },
            {
                components: [
                    { internalType: 'uint256', name: 'sellTokenIndex', type: 'uint256' },
                    { internalType: 'uint256', name: 'buyTokenIndex', type: 'uint256' },
                    { internalType: 'address', name: 'receiver', type: 'address' },
                    { internalType: 'uint256', name: 'sellAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'buyAmount', type: 'uint256' },
                    { internalType: 'uint32', name: 'validTo', type: 'uint32' },
                    { internalType: 'bytes32', name: 'appData', type: 'bytes32' },
                    { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'flags', type: 'uint256' },
                    { internalType: 'uint256', name: 'executedAmount', type: 'uint256' },
                    { internalType: 'bytes', name: 'signature', type: 'bytes' },
                ],
                internalType: 'struct GPv2Trade.Data',
                name: 'trade',
                type: 'tuple',
            },
        ],
        name: 'swap',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'vault',
        outputs: [{ internalType: 'contract IVault', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'vaultRelayer',
        outputs: [{ internalType: 'contract GPv2VaultRelayer', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    { stateMutability: 'payable', type: 'receive' },
];

export const ERC20ABI = [
    {
        inputs: [{ internalType: 'address', name: 'implementationContract', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'address', name: 'previousAdmin', type: 'address' },
            { indexed: false, internalType: 'address', name: 'newAdmin', type: 'address' },
        ],
        name: 'AdminChanged',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'address', name: 'implementation', type: 'address' }],
        name: 'Upgraded',
        type: 'event',
    },
    { stateMutability: 'payable', type: 'fallback' },
    {
        inputs: [],
        name: 'admin',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newAdmin', type: 'address' }],
        name: 'changeAdmin',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'implementation',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newImplementation', type: 'address' }],
        name: 'upgradeTo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newImplementation', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        name: 'upgradeToAndCall',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
];

export const ExtensibleFallbackHandlerABI = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
            { indexed: false, internalType: 'contract ISafeSignatureVerifier', name: 'verifier', type: 'address' },
        ],
        name: 'AddedDomainVerifier',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' },
        ],
        name: 'AddedInterface',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes4', name: 'selector', type: 'bytes4' },
            { indexed: false, internalType: 'bytes32', name: 'method', type: 'bytes32' },
        ],
        name: 'AddedSafeMethod',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
            { indexed: false, internalType: 'contract ISafeSignatureVerifier', name: 'oldVerifier', type: 'address' },
            { indexed: false, internalType: 'contract ISafeSignatureVerifier', name: 'newVerifier', type: 'address' },
        ],
        name: 'ChangedDomainVerifier',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes4', name: 'selector', type: 'bytes4' },
            { indexed: false, internalType: 'bytes32', name: 'oldMethod', type: 'bytes32' },
            { indexed: false, internalType: 'bytes32', name: 'newMethod', type: 'bytes32' },
        ],
        name: 'ChangedSafeMethod',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
        ],
        name: 'RemovedDomainVerifier',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' },
        ],
        name: 'RemovedInterface',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'contract Safe', name: 'safe', type: 'address' },
            { indexed: false, internalType: 'bytes4', name: 'selector', type: 'bytes4' },
        ],
        name: 'RemovedSafeMethod',
        type: 'event',
    },
    { stateMutability: 'nonpayable', type: 'fallback' },
    {
        inputs: [
            { internalType: 'bytes4', name: '_interfaceId', type: 'bytes4' },
            { internalType: 'bytes32[]', name: 'handlerWithSelectors', type: 'bytes32[]' },
        ],
        name: 'addSupportedInterfaceBatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'contract Safe', name: '', type: 'address' },
            { internalType: 'bytes32', name: '', type: 'bytes32' },
        ],
        name: 'domainVerifiers',
        outputs: [{ internalType: 'contract ISafeSignatureVerifier', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: '_hash', type: 'bytes32' },
            { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        name: 'isValidSignature',
        outputs: [{ internalType: 'bytes4', name: 'magic', type: 'bytes4' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256[]', name: '', type: 'uint256[]' },
            { internalType: 'uint256[]', name: '', type: 'uint256[]' },
            { internalType: 'bytes', name: '', type: 'bytes' },
        ],
        name: 'onERC1155BatchReceived',
        outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'bytes', name: '', type: 'bytes' },
        ],
        name: 'onERC1155Received',
        outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'bytes', name: '', type: 'bytes' },
        ],
        name: 'onERC721Received',
        outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes4', name: '_interfaceId', type: 'bytes4' },
            { internalType: 'bytes4[]', name: 'selectors', type: 'bytes4[]' },
        ],
        name: 'removeSupportedInterfaceBatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'contract Safe', name: '', type: 'address' },
            { internalType: 'bytes4', name: '', type: 'bytes4' },
        ],
        name: 'safeInterfaces',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'contract Safe', name: '', type: 'address' },
            { internalType: 'bytes4', name: '', type: 'bytes4' },
        ],
        name: 'safeMethods',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
            { internalType: 'contract ISafeSignatureVerifier', name: 'newVerifier', type: 'address' },
        ],
        name: 'setDomainVerifier',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes4', name: 'selector', type: 'bytes4' },
            { internalType: 'bytes32', name: 'newMethod', type: 'bytes32' },
        ],
        name: 'setSafeMethod',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' },
            { internalType: 'bool', name: 'supported', type: 'bool' },
        ],
        name: 'setSupportedInterface',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
];