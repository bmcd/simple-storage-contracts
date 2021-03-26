pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";


/**
 * @title Marketplace
 * @notice Based on Classifieds from https://github.com/HQ20/contracts/blob/master/contracts/classifieds/Classifieds.sol
 */
contract Marketplace is Initializable, ERC721Holder {
    event TradeStatusChange(uint256 ad, address poster, uint256 tokenId, uint256 price, bytes32 status);

    IERC20 currencyToken;
    IERC721 itemToken;

    struct Trade {
        address poster;
        uint256 item;
        uint256 price;
        bytes32 status; // Open, Executed, Cancelled
    }

    mapping(uint256 => Trade) public trades;

    uint256 tradeCounter;

    function initialize(address _currencyTokenAddress, address _itemTokenAddress)
    public
    initializer
    {
        currencyToken = IERC20(_currencyTokenAddress);
        itemToken = IERC721(_itemTokenAddress);
        tradeCounter = 0;
    }

    /**
     * @dev Returns the details for a trade.
     * @param _trade The id for the trade.
     */
    function getTrade(uint256 _trade)
    public
    virtual
    view
    returns(address, uint256, uint256, bytes32)
    {
        Trade memory trade = trades[_trade];
        return (trade.poster, trade.item, trade.price, trade.status);
    }

    /**
     * @dev Opens a new trade. Puts _item in escrow.
     * @param _item The id for the item to trade.
     * @param _price The amount of currency for which to trade the item.
     */
    function openTrade(uint256 _item, uint256 _price)
    public
    virtual
    {
        itemToken.safeTransferFrom(msg.sender, address(this), _item);
        trades[tradeCounter] = Trade({
        poster: msg.sender,
        item: _item,
        price: _price,
        status: "Open"
        });
        tradeCounter += 1;
        emit TradeStatusChange(tradeCounter - 1, msg.sender, _item, _price, "Open");
    }

    /**
     * @dev Executes a trade. Must have approved this contract to transfer the
     * amount of currency specified to the poster. Transfers ownership of the
     * item to the filler.
     * @param _trade The id of an existing trade
     */
    function executeTrade(uint256 _trade)
    public
    virtual
    {
        Trade memory trade = trades[_trade];
        require(trade.status == "Open", "Trade is not Open.");
        currencyToken.transferFrom(msg.sender, trade.poster, trade.price);
        itemToken.safeTransferFrom(address(this), msg.sender, trade.item);
        trades[_trade].status = "Executed";
        emit TradeStatusChange(_trade, trade.poster, trade.item, trade.price, "Executed");
    }

    /**
     * @dev Cancels a trade by the poster.
     * @param _trade The trade to be cancelled.
     */
    function cancelTrade(uint256 _trade)
    public
    virtual
    {
        Trade memory trade = trades[_trade];
        require(
            msg.sender == trade.poster,
            "Trade can be cancelled only by poster."
        );
        require(trade.status == "Open", "Trade is not Open.");
        itemToken.safeTransferFrom(address(this), trade.poster, trade.item);
        trades[_trade].status = "Cancelled";
        emit TradeStatusChange(_trade, trade.poster, trade.item, trade.price, "Cancelled");
    }
}
