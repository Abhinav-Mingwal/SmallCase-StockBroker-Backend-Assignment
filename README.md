# SmallCase-StockBroker-Backend-Assignment
StockBroker is an API system to trade Securities where users get functionality to calculate return and modify any of the trade at any point of time

## Create API for Trading Securities

## Tech Stack
* Node
* Express
* MongoDB


API endpoint : https://smallcase-stockbroker.herokuapp.com/api/

### `https://smallcase-stockbroker.herokuapp.com/api/trade/`
## Trade

## GET
`/api/trade`
* GET api will return list of all Trades corresponding to Securities

## GET
`/api/trade/:trade_id`
* GET api will return Trades corresponding to a Security

## PUT
`/api/trade/:trade_id`
* PUT api will update the Trades corresponding to trade_id
```
body :{
	"ticker_symbol":"INFY",
	"quantity":5,
	"price":80,
	"type":"BUY"
}
```

## DELETE
`/api/trade/:trade_id`
* will delete trade corresponding to trade_id
 
## POST
`/api/trade`
* will create a new Trade
```
body: {
	"ticker_symbol":"TCS",
	"quantity":10,
	"price":80,
	"type":"BUY"
}
```
  
### `https://smallcase-stockbroker.herokuapp.com/api/returns/`
## GET
`/api/returns/`
* will return Cummulative Sum of all the holdings.

  
### `https://smallcase-stockbroker.herokuapp.com/api/portfolio/` 
## GET
`/api/portfolio/`
* will provide list of portfolio with average buy price and quantity.

## GET
`/api/portfolio/:portfolio_id`
* will provide details of a security.
 
