import 'dotenv/config'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify } from '@libp2p/identify'
import { tcp } from '@libp2p/tcp'
import { FsBlockstore } from 'blockstore-fs'
import { MemoryDatastore } from 'datastore-core'
import { createHelia } from 'helia'
import { createLibp2p } from 'libp2p'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { peerIdFromKeys } from '@libp2p/peer-id';
import fs from 'fs';
import { ethers } from 'ethers';
import contractABI from './abis/BootstrapPeerRegistry.json'  with { type: "json" };
import net from 'net';


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, contractABI.abi, wallet);

async function updateMultiAddrLocationOnDestraNetwork(peerId, multiaddr) {
    console.log("Attempting to update location on the blockchain...", { peerId, multiaddr });
    try {
        const tx = await contract.updateLocation(peerId.toString(), multiaddr);
        console.log("Transaction submitted. Waiting for confirmation...");
        await tx.wait();
        console.log(`MultiAddr Location successfully updated in Destra Network for Peer ID: ${peerId}`);
    } catch (error) {
        console.error('Failed to update location:', error);
    }
}

async function loadPeerIdFromKeys() {
    console.log("Loading Peer ID from keys...");
    const privateKeyBytes = fs.readFileSync('./keys/private.key');
    const publicKeyBytes = fs.readFileSync('./keys/public.key');

    return peerIdFromKeys(publicKeyBytes, privateKeyBytes);
}

function pingHost(ip, port, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        const address = `${ip}:${port}`;

        socket.setTimeout(timeout);
        socket.on('connect', () => {
            console.log(`Successfully connected to ${address}`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            console.log(`Connection to ${address} timed out.`);
            socket.destroy();
            reject(new Error('Connection timed out'));
        });

        socket.on('error', (err) => {
            console.log(`Connection to ${address} failed: ${err.message}`);
            socket.destroy();
            reject(err);
        });

        socket.connect(port, ip);
    });
}


async function createDestraBootstrapNode() {
    console.log("Creating Destra Bootstrap Node...");

    const blockstore = new FsBlockstore('./block_store')

    const datastore = new MemoryDatastore()

    const peerId = await loadPeerIdFromKeys();
    console.log("Peer ID loaded successfully:", peerId.toString());


    console.log("Configuring libp2p...");


    const libp2p = await createLibp2p({
        peerId,
        datastore,
        addresses: {
            listen: [
                `/ip4/0.0.0.0/tcp/${process.env.NODE_PORT}`
            ]
        },
        transports: [
            tcp()
        ],
        connectionEncryption: [
            noise()
        ],
        streamMuxers: [
            yamux()
        ],

        services: {
            identify: identify(),
            aminoDHT: kadDHT({
                protocol: '/ipfs/kad/1.0.0',
                peerInfoMapper: removePrivateAddressesMapper
            })
        }
    })

    console.log("libp2p configured. Initializing Destra Bootstrap Node...");


    return await createHelia({
        datastore,
        blockstore,
        libp2p
    })
}


async function main() {
    const destraBootstrapNode = await createDestraBootstrapNode()
    console.log("Destra Storage Bootstrap Node initialized successfully.");

    const multiAddrLocation = `/ip4/${process.env.PUBLIC_IP}/tcp/${process.env.NODE_PORT}`
    const peerId = destraBootstrapNode.libp2p.peerId.toString()

    console.log("Destra Storage Bootstrap Node started with MultiAddress and Peer ID:", multiAddrLocation, peerId);

    console.log(`Pinging ${process.env.PUBLIC_IP} on port ${process.env.NODE_PORT} to check firewall settings...`);
    await pingHost(process.env.PUBLIC_IP, process.env.NODE_PORT);
    console.log("Ping successful, firewall settings appear to be correct.");


    if (multiAddrLocation.length > 0) {
        console.log("Updating MultiAddress Location on the Destra Network...");

        await updateMultiAddrLocationOnDestraNetwork(peerId, multiAddrLocation);
    }
    console.log("-------------------------------------\nAll set, your bootstrap node is up and running...");
}

main();