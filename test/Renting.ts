import { expect } from "chai";
import { ethers } from "hardhat";

describe("rentRequest",async function () {
    it("Should create rent property request", async function () {
        const Renting = await ethers.getContractFactory("Renting"); // Get contract
        const rentingInstance = await Renting.deploy(); // Send deploy request
        await rentingInstance.waitForDeployment(); // Wait until our contract deployed
        const [ propertyOwner, hirer ] = await ethers.getSigners(); // Getting signers for test from network.
        // Default user is propertyOwner, because of this address is the first address

        // function createProperty(string calldata _name, string calldata _sort, string calldata _adres, uint256 _price)/
        await rentingInstance.createProperty("Melih's home","home", "Istanbul","1000"); // Property owner creates his property to rent
        // Function that above will create an property id
        const propertyIds = await rentingInstance.getProperties(); // Get all ids with rentable properties
        await rentingInstance.connect(hirer).rentRequest(propertyIds[0]) // We connected as hirer and created a rent request for given property id
        const rentRequests = await rentingInstance.getRentRequests(propertyIds[0]); // We bring the all rent requests for this property
        expect(rentRequests[0]).to.equal(hirer.address); // Expected that hirer wallet address equals to who requested for rent to this property
    });
});
describe("rentProperty",async function () {
    it("Should rent property to hirer", async function () {
        const Renting = await ethers.getContractFactory("Renting"); // Get contract
        const rentingInstance = await Renting.deploy(); // Send deploy request
        await rentingInstance.waitForDeployment(); // Wait until our contract deployed
        const [ propertyOwner, hirer ] = await ethers.getSigners(); // Getting signers for test from network.
        // Default user is propertyOwner, because of this address is the first address

        // function createProperty(string calldata _name, string calldata _sort, string calldata _adres, uint256 _price)/
        await rentingInstance.createProperty("Melih's home","home", "Istanbul","1000"); // Property owner creates his property to rent
        // Function that above will create an property id
        const propertyIds = await rentingInstance.getProperties(); // Get all ids with rentable properties
        await rentingInstance.connect(hirer).rentRequest(propertyIds[0]) // We connected as hirer and created a rent request for given property id
        const rentRequests = await rentingInstance.getRentRequests(propertyIds[0]); // We bring the all rent requests for this property
        // function rentProperty(bytes32 _id, address _hirer, uint256 _endDateAsDay)
        await rentingInstance.rentProperty(propertyIds[0],rentRequests[0],1);
        const propertyInfo = await rentingInstance.getPropertyInfo(propertyIds[0]);
        expect(propertyInfo.hirer).to.equal(hirer.address); // Expected that hirer wallet address equals to who requested for rent to this property
    });
});
