//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.12;

import "./ERC20.sol";

contract StakingRewards {
    address private owner;

    ERC20 public rewardsToken;
    ERC20 public stakingToken;

    uint private _stack_to_reward_persent;
    uint private _sec_to_reward_getting;

    mapping(address => uint) private _balances;
    mapping(address => uint) private _balance_times;
    mapping(address => uint) private _rewards;

    constructor(address _stakingToken, address _rewardsToken) {
        owner = msg.sender;
        stakingToken = ERC20(_stakingToken);
        rewardsToken = ERC20(_rewardsToken);
        _stack_to_reward_persent = 20;
        _sec_to_reward_getting = 60 * 10;
    }

    function stake(uint amount) external {
        calc_rewards(msg.sender);
        _balances[msg.sender] += amount;
        stakingToken.transferFrom(msg.sender, payable(address(this)), amount);
    }

    function claim() external {
        calc_rewards(msg.sender);
        rewardsToken.transfer(payable(msg.sender), _rewards[msg.sender]);
        _rewards[msg.sender] = 0;
    }

    function unstake(uint amount) external {
        require(amount <= _balances[msg.sender], "No coins to unstake");
        calc_rewards(msg.sender);
        _balances[msg.sender] -= amount;
        stakingToken.transfer(payable(msg.sender), amount);
    }

    function balanceOf(address _owner) public view returns (uint256 balance){
        require(_owner != address(0), "balanceOf zero address");
        balance = _balances[_owner];
    }

    function setRewardPersent(uint persent) external{
        require(msg.sender == owner, "setRewardPersent can calls only by owner");
        _stack_to_reward_persent = persent;
    }

    function setRewardTimer(uint seconds_) external{
        require(msg.sender == owner, "setRewardTimer can calls only by owner");
        _sec_to_reward_getting = seconds_;
    }

    function calc_rewards(address addr) internal{
        uint time = (block.timestamp - _balance_times[addr]) / _sec_to_reward_getting;
        _rewards[addr] += _balances[addr] * time * (100 / _stack_to_reward_persent);
        _balance_times[addr] = block.timestamp;
    }
}