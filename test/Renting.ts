import { expect } from "chai";
import { ethers } from "hardhat";

describe("rentRequest",async function () {
    it("Should create rent property request", async function () {
        const Renting = await ethers.getContractFactory("Renting"); // Get contract
        const rentingInstance = await Renting.deploy(); // Send deploy request
        await rentingInstance.waitForDeployment(); // Wait until our contract deployed
        const [ propertyOwner, hirer ] = await ethers.getSigners(); // Getting signers for test from network.
        // Default user is propertyOwner, because of this address is the first address

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


        await rentingInstance.createProperty("Melih's home","home", "Istanbul","1000"); // Property owner creates his property to rent
        // Function that above will create an property id
        const propertyIds = await rentingInstance.getProperties(); // Get all ids with rentable properties
        await rentingInstance.connect(hirer).rentRequest(propertyIds[0]) // We connected as hirer and created a rent request for given property id
        const rentRequests = await rentingInstance.getRentRequests(propertyIds[0]); // We bring the all rent requests for this property

        await rentingInstance.rentProperty(propertyIds[0],rentRequests[0],1); // Rent the property as property owner to the hirer
        const propertyInfo = await rentingInstance.getPropertyInfo(propertyIds[0]);
        expect(propertyInfo.hirer).to.equal(hirer.address); // Expected that hirer wallet address equals to who requested for rent to this property
    });
});
describe("createComplaintForHirer",async function () {
    it("Should create a complaint for hirer", async function () {
        const Renting = await ethers.getContractFactory("Renting"); // Get contract
        const rentingInstance = await Renting.deploy(); // Send deploy request
        await rentingInstance.waitForDeployment(); // Wait until our contract deployed
        const [ propertyOwner, hirer ] = await ethers.getSigners(); // Getting signers for test from network.
        // Default user is propertyOwner, because of this address is the first address


        await rentingInstance.createProperty("Melih's home","home", "Istanbul","1000"); // Property owner creates his property to rent
        // Function that above will create an property id
        const propertyIds = await rentingInstance.getProperties(); // Get all ids with rentable properties
        await rentingInstance.connect(hirer).rentRequest(propertyIds[0]) // We connected as hirer and created a rent request for given property id
        const rentRequests = await rentingInstance.getRentRequests(propertyIds[0]); // We bring the all rent requests for this property

        await rentingInstance.rentProperty(propertyIds[0],rentRequests[0],1); // Rent the property as property owner to the hirer
        const propertyInfo = await rentingInstance.getPropertyInfo(propertyIds[0]); // Get property info with given id

        await rentingInstance.createComplaintForHirer(propertyIds[0],"Hirer is not paying hire purchase") // Creating complaint for hirer
        const complaint = await rentingInstance.getAgreementComplaint(propertyIds[0]);

        expect(complaint.reason).to.equal("Hirer is not paying hire purchase"); // Expected that hirer wallet address equals to who requested for rent to this property
    });
});
describe("createComplaintForOwner",async function () {
    it("Should create a complaint for owner", async function () {
        const Renting = await ethers.getContractFactory("Renting"); // Get contract
        const rentingInstance = await Renting.deploy(); // Send deploy request
        await rentingInstance.waitForDeployment(); // Wait until our contract deployed
        const [ propertyOwner, hirer ] = await ethers.getSigners(); // Getting signers for test from network.
        // Default user is propertyOwner, because of this address is the first address


        await rentingInstance.createProperty("Melih's home","home", "Istanbul","1000"); // Property owner creates his property to rent
        // Function that above will create an property id
        const propertyIds = await rentingInstance.getProperties(); // Get all ids with rentable properties
        await rentingInstance.connect(hirer).rentRequest(propertyIds[0]) // We connected as hirer and created a rent request for given property id
        const rentRequests = await rentingInstance.getRentRequests(propertyIds[0]); // We bring the all rent requests for this property

        await rentingInstance.rentProperty(propertyIds[0],rentRequests[0],1); // Rent the property as property owner to the hirer
        const propertyInfo = await rentingInstance.getPropertyInfo(propertyIds[0]); // Get property info with given id

        await rentingInstance.connect(hirer).createComplaintForOwner(propertyIds[0],"Property owner is not fixing the broken door") // Creating complaint for hirer
        const complaint = await rentingInstance.connect(hirer).getAgreementComplaint(propertyIds[0]);

        expect(complaint.reason).to.equal("Property owner is not fixing the broken door"); // Expected that hirer wallet address equals to who requested for rent to this property
    });
});
describe("getComplaintAsUnauthorized",async function () {
    it("Should return error when unauthorized user requested the complaint", async function () {
        const Renting = await ethers.getContractFactory("Renting"); // Get contract
        const rentingInstance = await Renting.deploy(); // Send deploy request
        await rentingInstance.waitForDeployment(); // Wait until our contract deployed
        const [ propertyOwner, hirer, unknownUser ] = await ethers.getSigners(); // Getting signers for test from network.
        // Default user is propertyOwner, because of this address is the first address


        await rentingInstance.createProperty("Melih's home","home", "Istanbul","1000"); // Property owner creates his property to rent
        // Function that above will create an property id
        const propertyIds = await rentingInstance.getProperties(); // Get all ids with rentable properties
        await rentingInstance.connect(hirer).rentRequest(propertyIds[0]) // We connected as hirer and created a rent request for given property id
        const rentRequests = await rentingInstance.getRentRequests(propertyIds[0]); // We bring the all rent requests for this property

        await rentingInstance.rentProperty(propertyIds[0],rentRequests[0],1); // Rent the property as property owner to the hirer
        const propertyInfo = await rentingInstance.getPropertyInfo(propertyIds[0]); // Get property info with given id

        await rentingInstance.connect(hirer).createComplaintForOwner(propertyIds[0],"Property owner is not fixing the broken door") // Creating complaint for hirer
        const complaint = rentingInstance.connect(unknownUser).getAgreementComplaint(propertyIds[0]);

        await expect(complaint).to.be.revertedWith("You can't get complaints of this property")
    });
});
