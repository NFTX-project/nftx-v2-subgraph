# nftx-v2-subgraph

Subgraph for NFTX Protocol V2

Rinkeby Subgraph: https://thegraph.com/explorer/subgraph/dan13ram/nftx-v2-rinkeby

Mainnet Subgraph: <i>yet to be deployed</i>

## Config

The subgraph requires only the NFTXVaultFactoryUpgradable contract address and starting block number.

This network specific config can be configured by editing `config/<network>.json`

## Scripts

#### `yarn auth`

```sh
GRAPH_ACCESS_TOKEN=<access-token> yarn auth
```

#### `yarn prepare-<network>`

Generates subgraph.yaml for particular network.
Supported networks are rinkeby and mainnet.

#### `yarn codegen`

Generates AssemblyScript types for smart contract ABIs and the subgraph schema.

#### `yarn build`

Compiles the subgraph to WebAssembly.

#### `yarn deploy-<network>`

Deploys the subgraph for particular network to the official Graph Node.<br/>
