// "SPDX-License-Identifier: MIT"
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

// Manages the contributions and automation of payments for a Project crowdfunding.
contract Project {
    /** Libraries */
    // Init SafeMath for uint256 types.
    using SafeMath for uint256;

    /** Events */
    // Event that will be emitted whenever a funding will be received.
    event FundingReceived(address contributor, uint amount, uint currentRaisedFunds);
    // Event that will be emitted whenever a contributor is refunded with his contribution.
    event ContributorRefunded(address contributor);
    // Event that will be emitted whenever the project founder has received the raised funds.
    event FounderPaid(address founder);
    
    /** Storage */
    /// @dev The possible values for the status of the project (0 = )
    enum STATUS {FUNDRAISING, SUCCESSFUL, EXPIRED}  // FUNDRAISING = 0 default value.

    string public name;
    string public description;
    uint public amountGoal; // Required amount to reach (else, every contributor gets refunded).
    uint public deadline; 
    uint public completeAt;
    uint256 public raisedFunds; // The sum of funds raised for the project.
    address payable public founder; // Who starts the project.

    STATUS public status;

    /// @dev Takes an address and returns the amount of the contribution from that address (wei).
    mapping (address => uint256) public contributions;

    /** Modifiers */
    
    /// @dev Check if the project status is fundraising.
    modifier onlyFundraising() {
        require(status == STATUS.FUNDRAISING, "no-fundraising-status");
        _;
    }
    
    /// @dev Check if the project status is expired.
    modifier onlyExpired() {
        require(status == STATUS.EXPIRED, "no-expired-status");
        _;
    }
    
    /// @dev Check if the project status is successful.
    modifier onlySuccessful() {
        require(status == STATUS.SUCCESSFUL, "no-succesful-status");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        uint256 _deadline,
        uint256 _amountGoal,
        address payable _founder
    ) public {
        name = _name;
        description = _description;
        amountGoal = _amountGoal;
        deadline = _deadline;
        founder = _founder;
    }

    /// @notice Fund the project with a certain amount of wei.
    /// @dev Sum the amount of wei specified into tx msg.value.
    function contribute() external payable onlyFundraising() {
        require(msg.sender != founder, "contribution-from-founder");
        require(msg.value > 0, "zero-contribution");
                
        // Storage update.
        contributions[msg.sender] = contributions[msg.sender].add(msg.value); // Store the contribute.
        raisedFunds = raisedFunds.add(msg.value); // Sum the contribution to the raised funds balance.
        
        // Emit event.
        emit FundingReceived(msg.sender, msg.value, raisedFunds);

        // Update the project status if the goal is reached.
        _checkIfGoalAmountOrDeadlineAreReached();
    }

    /// @dev Returns the contribution to the caller if the deadline expires and the goal hasn't been reached.
    function refundMe() external payable onlyExpired() {
        require(contributions[msg.sender] > 0, "no-contribution");

        // Subtract the contribution.
        uint256 amountToRefund = contributions[msg.sender];
        contributions[msg.sender] -= amountToRefund;
        raisedFunds = raisedFunds.sub(amountToRefund);

        // Emit event.
        emit ContributorRefunded(msg.sender);
        
        // Refund the contributor.
        require(msg.sender.send(amountToRefund), "not-refund-contributor");
    }

    /// @dev Change the project status based on goal reached and deadline expired conditions.
    function _checkIfGoalAmountOrDeadlineAreReached() internal {
        // The project reached the deadline without achieving the goal.
        if (now > deadline)  {
            status = STATUS.EXPIRED;
        } else  // Check if the raised funds are greater than or equal to the goal. 
          if (raisedFunds >= amountGoal) {
            // The project reached the goal.
            status = STATUS.SUCCESSFUL; // Change the status to successful.
            _payFounder(); // Pay the project founder.
            completeAt = now; // Set the completion time.
        } 
    }

    /// @dev Function to give the received funds to the project founder.
    function _payFounder() internal onlySuccessful() {
        // Emit event.
        emit FounderPaid(founder);
        
        // Subtract the funds.
        uint256 amountToPay = raisedFunds;
        raisedFunds = 0;
        
        // Pay the project founder.
        require(founder.send(amountToPay), "founder-not-paid");
    }

    /** @notice Return every Project field data.
      * @return _name The name of the Project.
      * @return _description The description of the Project.
      * @return _amountGoal The amount to reach for the Project.
      * @return _deadline The expiration date for the funding process of the Project.
      * @return _completeAt The completion date when the funding process ends.
      * @return _raisedFunds The amount raised for the Project.
      * @return _founder The founder of the Project.
      * @return _status The status of the Project.
      */
    function getAllProjectData() external view returns(
        string memory _name,
        string memory _description,
        uint _amountGoal,
        uint _deadline,
        uint _completeAt,
        uint256 _raisedFunds,
        address _founder,
        STATUS _status
    ){
        return (
            name,
            description,
            amountGoal,
            deadline,
            completeAt,
            raisedFunds,
            founder,
            status
        );
    }
}
