import { network } from "hardhat";

const { viem } = await network.connect({
  network: "sepolia",
});

async function main(): Promise<void> {
  const [deployer] = await viem.getWalletClients();
  console.log("Deploying contract with the account:", deployer.account.address);

  const contractAddress = await viem.deployContract("TakafulInsurance");


  console.log("Contract deployed at:", contractAddress.address);
}

main().catch(console.error);