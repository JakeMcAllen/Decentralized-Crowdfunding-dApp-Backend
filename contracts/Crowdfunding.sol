// "SPDX-License-Identifier: MIT"
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Project.sol";

/// This contract enables the creation of Project SC for crowdfunding purposes.
contract Crowdfunding {
    /** Libraries */
    // Init SafeMath for uint256 types.
    using SafeMath for uint256;

    /** Events */
    // Event that will be emitted whenever a new project is started.
    event ProjectStarted(
        string name,
        string description,
        uint256 deadline,
        uint256 goalAmount,
        address projectAddress,
        address owner
    );
    
    /** Storage */
    /// @dev List of all started projects.
    Project[] private _projects;

    /** Modifiers */
    
    /** Methods */ 

    /** @notice Start a new Project.
      * @dev Creates a new Project Smart Contract initialized with the provided data.
      * @param name Name of the project to be created.
      * @param description Short description about the project.
      * @param durationInDays Project deadline in days.
      * @param amountToRaise Project goal in wei.
      */
    function startProject(
        string calldata name,
        string calldata description,
        uint durationInDays,
        uint amountToRaise
    ) external {
        // Compute the deadline timestamp adding the duration in days to current block timestamp (now).
        uint deadline = now.add(durationInDays.mul(1 days));
        
        // Create a new Project SC.
        Project newProject = new Project(name, description, deadline, amountToRaise, msg.sender);
        
        // Storage update.
        _projects.push(newProject);
        
        // Emit event.
        emit ProjectStarted(
            name,
            description,
            deadline,
            amountToRaise,
            address(newProject),
            msg.sender
        );
    }                                                                                                                                   

    /** @notice Return every Project SC address.
      * @return List of the every Project SC address.
      */
    function getAllProjects() external view returns(Project[] memory){
        return _projects;
    }
}