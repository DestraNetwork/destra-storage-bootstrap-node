# Destra Decentralized Storage Bootstrap Node

This repo contains the code necessary to run a bootstrap node for the Destra Decentralized Storage Network. It uses `libp2p` for peer-to-peer network capabilities, `ethers` for Ethereum blockchain interactions, and  other libraries to support decentralized data storage.

## Prerequisites

Before you start, you will need:

- Node.js and npm installed. You can download these from [Node.js official website](https://nodejs.org/).
- A public IP address where your node will be accessible.
- A system running Ubuntu.
- Wallet with atleast 0.1 Sepolia ETH for gas.
- Sepolia JSON-RPC API.

## Setup Instructions

### Clone the repository

First, clone this repository to your local machine using the following command:

```
git clone https://github.com/DestraNetwork/destra-storage-bootstrap-node
cd destra-storage-bootstrap-node
```

### Install npm dependencies

Run the following command to install the required npm dependencies:

```
npm install
```

### Set up environment variables

You will need to set up environment variables by copying the `.env.example` with following command:

```
cp .env.example .env
```

Now, you need to fill the following env variables:


```
RPC_URL=<Your_Ethereum_Node_RPC_URL>
PRIVATE_KEY=<Your_Private_Key>
CONTRACT_ADDRESS=<Destra_Peer_Registry_Address> [Sepolia: 0x12f781c9E2fcC6F2d05Fa3B9A28f2dF887391657]
PUBLIC_IP=<Your_Public_IP>
NODE_PORT=<Port_for_Node_to_Listen_On>
BLOCKSTORE_DIRECTORY=<Path_For_Blockstore>
KEYS_DIRECTORY=<Path_For_Keys>
```

Replace `<Your_Ethereum_Node_RPC_URL>`, `<Your_Private_Key>`, `<Destra_Peer_Registry_Address>`, `<Your_Public_IP>`, `<Port_for_Node_to_Listen_On>`, `<Path_For_Blockstore>`, and `<Path_For_Keys>` with your actual values.

### Configure the firewall

To allow traffic to your node, you'll need to open the specified port in the firewall. On Ubuntu, you can do this with the following commands:

```
sudo ufw allow <Port_for_Node_to_Listen_On>/tcp
```

Replace `<Port_for_Node_to_Listen_On>` with the port number you are using.

### Place your keys

Place your keys directory in this project's root dir, which you must've generated using `destra-storage-bootstrap-onboard`. If you didn't, please goto [destra-storage-bootstrap-onboard](https://github.com/DestraNetwork/destra-storage-bootstrap-onboard) to generate your keys and register your peer id.


### Start the Node

You can start your bootstrap node with the following command:

```
npm run bootstrap-node
```

This will initialize your bootstrap node and make it ready to storage nodes joining the Destra Decentralized Storage Network


## Contributing

Contributions are welcome! Please feel free to submit pull requests to the project.

## Support

For support, open an issue in the GitHub issue tracker for this repository.

Thank you for participating in the Destra network!
