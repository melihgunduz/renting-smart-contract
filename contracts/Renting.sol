// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "@openzeppelin/contracts/utils/Counters.sol";

contract Renting {

    using Counters for Counters.Counter;
    Counters.Counter private counter;


    address private contractOwner;

    bytes32[] private  browseProperties;

    mapping (bytes32 => mapping (address => Complaint)) agreementComplaints; // Complaints
    mapping (address => bool) blackList; // Black listed users
    mapping (address => Hirer) hirers; // Hirers
    mapping (address => PropertyOwner) owners; // Property owners
    mapping (bytes32 => Property) properties; // Properties
    mapping (bytes32 => mapping (address => bool)) propertyVotes; // Vote counter for break agreement
    mapping (bytes32 => address[]) rentRequests; // Rent property requests


    constructor() {
        contractOwner = msg.sender;
    }

    event AgreementBroken(address indexed owner, address indexed hirer, bytes32 indexed id);
    event BreakRequested(address indexed requestedBy, bytes32 indexed propertyId);
    event CreateComplaint(address indexed from, address indexed to, string problem);
    event PropertyCreated(address indexed  owner, bytes32 indexed id);
    event PropertyRented(address indexed hirer, bytes32 indexed id);
    event PropertyDeleted(bytes32 indexed id);
    event RentRequestSent(address indexed from, bytes32 indexed id);
    event UserMarked(address indexed adres);


    struct Complaint{
        address from;
        address to;
        string reason;
    }

    struct Hirer {
        address _address;
        uint256 balance;
        Property hiredProperty;
    }

    struct Property {
        address owner;
        address hirer;
        bool available;
        bytes32 id;
        string adres;
        string name;
        string sort;
        uint256 end;
        uint256 price;
        uint256 start;
        uint256 votes;
    }

    struct PropertyOwner {
        address _address;
        uint256 balance;
    }

    // All modifier messages are understandable that's why they do not need comment line

    modifier isAvailable(bytes32 _id) {
        require(properties[_id].available == true, "This property already rented");
        require(msg.sender != properties[_id].owner, "You cannot hire your own property");
        _;
    }

    modifier isBreakable(bytes32 _id) {
        require(properties[_id].hirer != address(0), "This property has not rented");
        if (msg.sender != contractOwner) {
            require(properties[_id].owner == msg.sender || properties[_id].hirer == msg.sender, "You can't break this agreement");
            require(properties[_id].votes == 2, "All users have to sign request to break agreement");
        }
        _;
    }

    modifier isBreakRequestable(bytes32 _id) {
        require(properties[_id].owner == msg.sender || properties[_id].hirer == msg.sender,"You can't create break request for this property");
        require(propertyVotes[_id][msg.sender] == false, "This user already signed this agreement");
        require(properties[_id].votes < 2, "No more users can sign this agreement anymore");
        _;
    }

    modifier isComplainable(bytes32 _id) {
        require(properties[_id].hirer != address(0), "This property has not rented");
        require(properties[_id].owner == msg.sender || properties[_id].hirer == msg.sender,"You can't create complaint for this property");
        require(agreementComplaints[_id][msg.sender].from != msg.sender, "You already created a complaint");
        _;
    }

    modifier isDeletable(bytes32 _id) {
        require(properties[_id].hirer == address(0), "This property has rented");
        require(properties[_id].owner != address(0), "There are no property with given id");
        require(properties[_id].owner == msg.sender, "You are not the owner of this property");
        _;
    }

    modifier isHirerCanRent(bytes32 _id){
        require(!blackList[msg.sender], "This user can't rent property");
        address[] memory requests = rentRequests[_id];
        bool user;
        for (uint32 i = 0; i < requests.length; ++i) {
            if (requests[i] == msg.sender){
                user = true;
            }
        }
        require(!user, "You can't sent request again for this property");
        _;
    }

    modifier isOwnerRentable(){
        require(!blackList[msg.sender], "This owner can't rent property");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only contract owner can execute this command");
        _;
    }

    // This function ends the agreement between property owner and hirer
    // and adds user who is guilty to the blacklist
    function breakAndAddToBlackList(bytes32 _id, address guilty) public onlyOwner {
        breakAgreement(_id);
        blackList[guilty] = true;
        emit UserMarked(guilty);
    }

    // This function ends the agreement between property owner and hirer
    // If function executing without admin both user have to sign agreement
    function breakAgreement(bytes32 _id) public isBreakable(_id) {
        delete propertyVotes[_id][properties[_id].hirer];
        delete propertyVotes[_id][properties[_id].owner];
        properties[_id].hirer = address(0);
        properties[_id].available = true;
        properties[_id].votes = 0;
        emit AgreementBroken(properties[_id].owner, properties[_id].hirer, _id);
    }

    // This function creates a request to break rent agreement, both user have to sign
    function createBreakRequest(bytes32 _id) public isBreakRequestable(_id) {
        propertyVotes[_id][msg.sender] = true;
        ++properties[_id].votes;
        if (properties[_id].votes == 2) {
            breakAgreement(_id);
        }
        emit BreakRequested(msg.sender, _id);
    }

    // In this function property owner makes a complaint for hirer
    function createComplaintForHirer(bytes32 _id, string calldata _reason) public isComplainable(_id) {
        require(properties[_id].owner == msg.sender, "You can't create complaint for yourself");
        agreementComplaints[_id][msg.sender] = Complaint(msg.sender,properties[_id].hirer, _reason);
        emit CreateComplaint(msg.sender, properties[_id].hirer, _reason);
    }

    // In this function hirer makes a complaint for property owner
    function createComplaintForOwner(bytes32 _id, string calldata _reason) public isComplainable(_id) {
        require(properties[_id].hirer == msg.sender, "You can't create complaint for yourself");
        agreementComplaints[_id][msg.sender] = Complaint(msg.sender,properties[_id].owner, _reason);
        emit CreateComplaint(msg.sender, properties[_id].owner, _reason);
    }

    // Property owner creates his property to rent
    function createProperty(string calldata _name, string calldata _sort, string calldata _adres, uint256 _price) public isOwnerRentable {
        bytes32 _id = generateHash();
        properties[_id] = Property(msg.sender, address(0), true, _id, _adres, _name, _sort, 0, _price, 0, 0);
        browseProperties.push(_id);
        emit PropertyCreated(msg.sender, _id);
    }

    // Property owner deletes his property
    function deleteProperty(bytes32 _id) public isDeletable(_id) {
        delete properties[_id];
        emit PropertyDeleted(_id);
    }

    // Get user's complaints about given id agreement
    function getAgreementComplaint(bytes32 _id) public view returns(Complaint memory) {
        require(msg.sender == properties[_id].owner || msg.sender == properties[_id].hirer,"You can't get complaints of this property");
        require(agreementComplaints[_id][msg.sender].from == msg.sender,"You didn't created complaint");
        return agreementComplaints[_id][msg.sender];
    }

    // Get all property ids which is rentable
    function getProperties() public view returns(bytes32[] memory) {
        return browseProperties;
    }

    // Get property info with given id
    function getPropertyInfo(bytes32 _id) public view returns(Property memory) {
        Property memory property = properties[_id];
        return property;
    }

    // Get rent requests with given property id
    function getRentRequests(bytes32 _id) public view returns(address[] memory) {
        return rentRequests[_id];
    }

    // Create a rent request to property owner
    function rentRequest(bytes32 _id) public isAvailable(_id) isHirerCanRent(_id) {
        rentRequests[_id].push(msg.sender);
        emit RentRequestSent(msg.sender, _id);
    }

    // After signs, rent property to hirer
    function rentProperty(bytes32 _id, address _hirer, uint256 _endDateAsDay) public isOwnerRentable {
        require(properties[_id].available == true, "This property already rented");
        require(msg.sender == properties[_id].owner, "Only owner can execute this command");
        properties[_id].hirer = _hirer;
        properties[_id].available = false;
        properties[_id].start = block.timestamp;
        properties[_id].end = block.timestamp + _endDateAsDay * 1 days;
        hirers[_hirer].hiredProperty = properties[_id];
        emit PropertyRented(msg.sender, _id);
    }

    // Generate a unique key as property id
    function generateHash() private returns(bytes32) {
        counter.increment(); // Counter incremented
        return keccak256(abi.encodePacked(counter.current() + block.timestamp)); // Hash generated and returned
    }

    // Turn back unexpected transfers
    receive() external payable {
        revert();
    }

}
