// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Nox, euint256, externalEuint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IERC7984} from "../interfaces/IERC7984.sol";
import {IERC7984Receiver} from "../interfaces/IERC7984Receiver.sol";

/* ============================================================================
 * @title  ERC7984 — Confidential ERC-20 (compile-time stub)
 * @notice Plaintext-equivalent stub of the real ERC-7984 confidential token
 *         used so StealthGive can be unit-tested without the iExec Nox TEE
 *         runtime. Production deployments MUST use the real
 *         `@iexec-nox/nox-confidential-contracts` package.
 * ==========================================================================*/
abstract contract ERC7984 is IERC7984 {
    string public name;
    string public symbol;
    string public metadataURI;

    mapping(address account => euint256) internal _balances;
    mapping(address owner => mapping(address spender => uint48)) internal _operators;

    constructor(string memory _name, string memory _symbol, string memory _metadataURI) {
        name = _name;
        symbol = _symbol;
        metadataURI = _metadataURI;
    }

    // ---------------------------------------------------------------- Views
    function confidentialBalanceOf(address account) external view returns (euint256) {
        return _balances[account];
    }

    function isOperator(address owner, address spender) public view returns (bool) {
        return _operators[owner][spender] >= block.timestamp;
    }

    // ---------------------------------------------------------------- Operator
    function setOperator(address spender, uint48 until) external {
        _operators[msg.sender][spender] = until;
        emit OperatorSet(msg.sender, spender, until);
    }

    // ---------------------------------------------------------------- Transfers
    function confidentialTransfer(address to, euint256 amount) public returns (euint256) {
        return _update(msg.sender, to, amount);
    }

    function confidentialTransfer(address to, externalEuint256 amount, bytes calldata inputProof)
        external
        returns (euint256)
    {
        return _update(msg.sender, to, Nox.fromExternal(amount, inputProof));
    }

    function confidentialTransferFrom(address from, address to, euint256 amount) public returns (euint256) {
        require(from == msg.sender || isOperator(from, msg.sender), "ERC7984: not operator");
        return _update(from, to, amount);
    }

    function confidentialTransferFrom(
        address from,
        address to,
        externalEuint256 amount,
        bytes calldata inputProof
    ) external returns (euint256) {
        require(from == msg.sender || isOperator(from, msg.sender), "ERC7984: not operator");
        return _update(from, to, Nox.fromExternal(amount, inputProof));
    }

    function confidentialTransferAndCall(
        address recipient,
        externalEuint256 amount,
        bytes calldata inputProof,
        bytes calldata data
    ) external returns (euint256) {
        euint256 internalAmount = Nox.fromExternal(amount, inputProof);
        return confidentialTransferAndCall(recipient, internalAmount, data);
    }

    function confidentialTransferAndCall(address recipient, euint256 amount, bytes calldata data)
        public
        returns (euint256 transferred)
    {
        transferred = _update(msg.sender, recipient, amount);
        if (recipient.code.length > 0) {
            ebool accepted = IERC7984Receiver(recipient).onConfidentialTransferReceived(msg.sender, msg.sender, transferred, data);
            require(Nox.decryptBool(accepted), "ERC7984: receiver rejected");
        }
    }

    // ---------------------------------------------------------------- Hooks
    function _update(address from, address to, euint256 amount) internal virtual returns (euint256 transferred) {
        if (from != address(0)) {
            _balances[from] = Nox.sub(_balances[from], amount);
        }
        if (to != address(0)) {
            _balances[to] = Nox.add(_balances[to], amount);
        }
        emit ConfidentialTransfer(from, to);
        transferred = amount;
    }

    function _mint(address to, euint256 amount) internal virtual {
        _update(address(0), to, amount);
    }

    function _burn(address from, euint256 amount) internal virtual {
        _update(from, address(0), amount);
    }
}
