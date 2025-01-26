import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { createPublicClient, getContract } from 'viem'

export const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})

// Create a client for listening to events
export const publicClient = createPublicClient({
  chain: localhost,
  transport: http('http://127.0.0.1:8545')
}) 