# Find Oldest Transaction Signer on Solana

This repository contains a simple utility function that helps find the oldest transaction signer (funding wallet) for a given Solana wallet address.

## How it Works

The `findOldestTxSigner` function uses Solana's `getSignaturesForAddress` RPC method to traverse through a wallet's transaction history in a paginated way until it finds the oldest transaction. While this approach is somewhat primitive compared to using specialized infrastructure like LaserStream, it's a practical solution when you need a quick way to find a wallet's funding source without setting up complex infrastructure.

### Key Features:

- Paginated traversal through transaction signatures
- Handles rate limiting with delays between requests
- Sorts transactions by block time to ensure accurate chronological ordering
- Fallback logic for different transaction formats when identifying signers
- Built-in safeguards against excessive requests for large wallets

### Limitations:

- May be slower than specialized indexing solutions
- Could hit rate limits on public RPC nodes
- Helius was used but any RPC node can be used
# getSignaturesForAddress-traverse
