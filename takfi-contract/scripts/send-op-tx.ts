import { network } from "hardhat";
// const [owner] = await hre.ethers.getSigners();
const { viem } = await network.connect({
  network: "baseSepolia"
});

console.log("Sending transaction on Base network");

const [sender] = await viem.getWalletClients();

console.log("Sending 10_000_000_000 wei from", sender.account.address, "to itself");

console.log("Sending transaction");
await sender.sendTransaction({
  to: sender.account.address,
  value: 10_000_000_000n
});

// await viem.waitForTransactionReceipt({ hash: tx });
console.log("Transaction sent successfully");