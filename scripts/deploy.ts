import { ethers } from "hardhat";

async function main() {
  const Renting = await ethers.deployContract("Renting"); //defining our contract

  console.log('Contract deploying by:', Renting.deploymentTransaction().from);
  console.log('Contract deploying with tx hash:', Renting.deploymentTransaction().hash);
  await Renting.waitForDeployment(); // deploying our contract on network
  console.log('Contract deployed 🎉')
  console.log('Contract address: ', Renting.target) // writing contract address to the console
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
