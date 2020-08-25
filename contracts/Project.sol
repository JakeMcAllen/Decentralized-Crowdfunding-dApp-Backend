// "SPDX-License-Identifier: MIT"
pragma solidity >=0.6.0 <0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";

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
    // Event that will be emitted whenever the project starter has received the raised funds.
    event StarterPaid(address starter);
    
    /** Storage */
    /// @dev The possible values for the status of the project (0 = )
    enum STATUS {FUNDRAISING, EXPIRED, SUCCESSFUL}  // FUNDRAISING = 0 default value.

    string public name;
    string public description;
    uint public amountGoal; // Required amount to reach (else, every contributor gets refunded).
    uint public deadline; 
    uint public completeAt;
    uint256 public raisedFunds; // The sum of funds raised for the project.
    address payable public starter; // Who starts the project.

    STATUS public status;

    /// @dev Takes an address and returns the amount of the contribution from that address (wei).
    mapping (address => uint256) public contributions;

    /** Modifiers */
    
    /// @dev Check if the project status is fundraising.
    modifier onlyFundraising() {
        require(status == STATUS.FUNDRAISING, "Project doesn't have a fundraising status");
        _;
    }
    
    /// @dev Check if the project status is expired.
    modifier onlyExpired() {
        require(status == STATUS.EXPIRED, "Project doesn't have an expired status");
        _;
    }
    
    /// @dev Check if the project status is successful.
    modifier onlySuccessful() {
        require(status == STATUS.SUCCESSFUL, "Project doesn't have a successful status");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        uint256 _deadline,
        uint256 _amountGoal,
        address payable _starter
    ) public {
        name = _name;
        description = _description;
        amountGoal = _amountGoal;
        deadline = _deadline;
        starter = _starter;
    }

    /// @notice Fund the project with a certain amount of wei.
    /// @dev Sum the amount of wei specified into tx msg.value.
    function contribute() external payable onlyFundraising() {
        require(msg.sender != starter, "You cannot fund your project!");
        require(msg.value > 0, "You cannot send funds to your project!");
                
        // Storage update.
        contributions[msg.sender] = contributions[msg.sender].add(msg.value); // Store the contribute.
        raisedFunds = raisedFunds.add(msg.value); // Sum the contribution to the raised funds balance.
        
        // Emit event.
        emit FundingReceived(msg.sender, msg.value, raisedFunds);

        // Update the project status if the goal is reached.
        _checkIfGoalAmountIsReached();
    }

        /// @dev Returns the contribution to the caller if the deadline expires and the goal hasn't been reached.
    function refundMe() external payable onlyExpired() {
        require(contributions[msg.sender] > 0, "You didn't contribute to this project!");

        // Subtract the contribution from the raised funds.
        uint256 amountToRefund = contributions[msg.sender];
        raisedFunds = raisedFunds.sub(amountToRefund);

        // Emit event.
        emit ContributorRefunded(msg.sender);
        
        // Refund the contributor.
        require(msg.sender.send(contributions[msg.sender]), "Cannot refund the contributor!");
    }

    /// @dev Change the project status based on goal reached and deadline expired conditions.
    function _checkIfGoalAmountIsReached() internal {
        // The project reached the deadline without achieving the goal.
        if (now > deadline)  {
            status = STATUS.EXPIRED;
        } else  // Check if the raised funds are greater than or equal to the goal. 
          if (raisedFunds >= amountGoal) {
            // The project reached the goal.
            status = STATUS.SUCCESSFUL; // Change the status to successful.
            _payStarter(); // Pay the project starter.
            completeAt = now; // Set the completion time.
        } 
    }

    /// @dev Function to give the received funds to the project starter.
    function _payStarter() internal onlySuccessful() {
        // Emit event.
        emit StarterPaid(starter);
        
        // Pay the project starter.
        require(starter.send(raisedFunds), "Cannot pay the starter!");
    }
}
