//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.12;

contract ERC20 {
    address private owner;

    string private _name;
    string private _symbol;

    uint256 private _totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
    }
    
    /* PUBLIC VIEW */

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256 balance){
        require(_owner != address(0), "ERC20: balanceOf zero address");

        balance = _balances[_owner];
    }

    /* PUBLIC */

    function _transfer(address from, address to, uint256 value) internal{
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(_balances[from] >= value, "ERC20: transfer no balance");

        _balances[from] -= value;
        _balances[to] += value;
        emit Transfer(from, to, value);
    }

    function transfer(address payable _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        success = true;
    }

    function transferFrom(address _from, address payable _to, uint256 _value) public returns (bool success) {
        require(_allowances[_from][msg.sender] >= _value, "ERC20: transferFrom no allowered balance");

        _transfer(_from, _to, _value);
        _allowances[_from][msg.sender] -= _value;
        success = true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "ERC20: approve for the zero address");

        _allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        success = true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        remaining = _allowances[_owner][_spender];
    }

    /* EVENT */

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    /* ADDITIONAL */

    function burn(address account, uint256 amount) public{
        require(msg.sender == owner, "ERC20: burn must run only by owner");
        require(account != address(0), "ERC20: burn from the zero address");
        require(_balances[account] >= amount, "ERC20: burn no balance");

        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    function mint(address account, uint256 amount) public{
        require(msg.sender == owner, "ERC20: mint must run only by owner");
        require(account != address(0), "ERC20: mint to the zero address");

        _balances[account] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), account, amount);
    }
}