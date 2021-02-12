pragma solidity >=0.4.22 <0.7.0;

/* Progetto della tesi
 * @author: Giorgio Allena */

import "./Project.sol";

contract criptovalue {

    // input controll
    bool internal _updated = false;
    string internal _currentCross;
    uint internal _currentID = 0;

    event ppT (
        address owner, // address of the owner of the file stored on blockchain.
        uint transactionID, // identificatin number of transaction
        string cross, // name of cross of price predicted
        uint pp, // price predicted
        uint timestamp // date and time of creation.
    );
    event pricePrediction ( uint pp );
    

    struct ppTransaction {
        address owner; // address of the owner of the file stored on blockchain.
        uint transactionID; // identificatin number of transaction
        string cross; // name of cross of price predicted
        uint pp; // price predicted
        uint timestamp; // date and time of creation.
    }

    mapping(uint => ppTransaction) internal _fileData; // list of all files.
    mapping(address => ppTransaction[]) internal _userFiles; // array of lists of each user's records.
    

    // add a new price predected into blockchain
    function addPrice(
       string memory cross, 
       uint pp, 
       
    ) external {
        _fileData[_currentID] = ppTransaction(msg.sender, _currentID, cross, pp, block.timestamp);
        _userFiles[msg.sender].push(_fileData[_currentID]);
        _currentID++;

	emit ppT(msg.sender, _currentID, cross, pp, block.timestamp);
    }

    // get last price predicted
    function getLastPP() external { emit pricePrediction ( _fileData[_currentID-1].pp ); }


                                                                                                          

    // Following two function get information of a transaction from input id. 
    // First one give only the price predicted, while the second one give all information about transaction
    function getPpById(uint tId) public view returns(uint) { return _fileData[tId].pp; }
    function getTrtById(uint tId) public view returns(address owner, uint id, string memory cross, uint pp, uint time) 
        { return (_fileData[tId].owner, _fileData[tId].transactionID, _fileData[tId].cross, _fileData[tId].pp, _fileData[tId].timestamp); }
    
    // getLastId
    function getLastId() public view returns (uint) { return _fileData[_currentID-1].transactionID; }
}
