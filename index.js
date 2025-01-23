export async function findOldestTxSigner(walletAddress) {
  try {
    let currentSig = null;
    let emptyResponseCount = 0;
    let requestCount = 0;
    const MAX_REQUESTS = 500; // About 500,000 transactions give or take.
    let oldestSig = null;
    let oldestSlot = Infinity;

    while (emptyResponseCount < 5 && requestCount < MAX_REQUESTS) {
      requestCount++;
      console.log("request count", requestCount);

      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getSignaturesForAddress",
          params: [
            walletAddress,
            currentSig
              ? {
                  before: currentSig,
                }
              : {},
          ],
        }),
      });

      const data = await response.json();

      if (!data.result || data.result.length === 0) {
        emptyResponseCount++;
        console.log(`Confirming first signature #${emptyResponseCount}`);
        await new Promise((resolve) => setTimeout(resolve, 1111));
        continue;
      }

      emptyResponseCount = 0;

      const sortedData = [...data.result].sort((a, b) => a.blockTime - b.blockTime);
      const oldestInBatch = sortedData[0];

      if (oldestInBatch.slot < oldestSlot) {
        oldestSlot = oldestInBatch.slot;
        oldestSig = oldestInBatch.signature;
      }

      currentSig = oldestInBatch.signature;
    }

    if (requestCount >= MAX_REQUESTS) {
      return {
        signer: null,
        oldestSig: null,
        status: "WALLET_TOO_LARGE",
      };
    }

    const txResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getTransaction",
        params: [
          oldestSig,
          {
            encoding: "json",
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
    });

    const txData = await txResponse.json();
    const signer =
      txData.result?.transaction?.message?.accountKeys[0] ||
      txData.result?.transaction?.message?.accountKeys?.find((key) => key.signer) ||
      txData.result?.meta?.loadedAddresses?.writable?.[0] ||
      txData.result?.meta?.innerInstructions?.[0]?.instructions?.[0]?.accounts?.[0] ||
      null;

    return {
      signer,
      oldestSig,
      status: "SUCCESS",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// findOldestTxSigner("4Rob2yWsduPEkhnSxL9ozNBuhR8aZrywmbd9ZwWd2xWe");
