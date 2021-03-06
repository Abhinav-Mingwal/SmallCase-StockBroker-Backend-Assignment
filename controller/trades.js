const Portfolio = require("../models/portfolio")
const Trade = require("../models/trade")
const utils = require("../utils/utils")


/**
 * 
 * @param {*} body 
 */
async function addTrade(body){
    try{
        //validator to verify all the Body parameters
        let check = utils.tradeValidator(body);
        if(check){
            return check
        }
        // in case of a Sell Trade we need to check whether the trade is feasible or not
        if(body.type.toUpperCase() == 'SELL'){
            let portfolio = await Portfolio.findByTickerSymbol(body.ticker_symbol)
            if(portfolio && portfolio.quantity<body.quantity){
                return{
                    status:false,
                    message: "Sell Quantity Exceeds Current Portfolio limit!!"
                }
            }
            else if(!portfolio){
                return{
                    status:false,
                    message: `Trade cannot be made as ${body.ticker_symbol} doesn't exist in your portfolio`
                }
            }
        }
        var trade = new Trade({
            ticker_symbol:body.ticker_symbol,
            price:body.price,
            quantity:body.quantity,
            type:body.type,
        })
        await trade.save()
        var port = await Portfolio.findByTickerSymbol(body.ticker_symbol)
        // making sure if Trade Doesn't exist in Portfolio we will create a new One and append the Trade within the Portfolio
        if(port){
            if(!port.trades){
                port.trades=[]
            }
            port.trades.push(trade)
            // Utils method which calculates avg price based on current trade and portfolios parameters
            port.avg_buy_price = utils.avgPriceAfterBuySell(port,body)
            // update Quantity in case BUY or SELL
            port.quantity = port.quantity + ((body.type.toUpperCase() == 'BUY')?body.quantity:-body.quantity);
        }else{
            port = new Portfolio({
                ticker_symbol: body.ticker_symbol,
                avg_buy_price: body.price,
                quantity: body.quantity,
                type: body.type,
                trades : [trade]
            })
        }
        await port.save()
        return{
            status : true,
            message: "Added Trade Successfully!!",
            data : {
                id : trade._id,
                ticker_symbol:trade.ticker_symbol,
                price:trade.price,
                quantity:trade.quantity,
                type:trade.type
            }
        }
    }catch(err){
        console.log(err)
        return{
            status : false,
            message : err.message
        }
    }
}

async function editTrade(trade_id,body){
    try{
        let check = utils.tradeValidator(body);
        if(check){
            return check
        }
        if(!utils.uuidRegexCheck(trade_id)){
            return{
                status: false,
                message: "Invalid ID provided!!"
            }
        }
        let trade = await Trade.findById(trade_id)
        if(!trade){
            return{
                status: false,
                message: "Trade Not Found!!"
            }
        }
        // a case-insensitive method to get portfolio by ticker_symbol
        let oldPortfolio = await Portfolio.findByTickerSymbol(trade.ticker_symbol)
        if(!oldPortfolio){
            return{
                status: false,
                message: `Trade cannot be made as ${trade.ticker_symbol} doesn't exist in your portfolio`
            }
        }


        var newPortfolio = oldPortfolio
        // keep a flag for in case ticker_symbol is same or changed on Update
        let sameTickerFlag = (trade.ticker_symbol.toUpperCase() == body.ticker_symbol.toUpperCase())
        if(!sameTickerFlag){
            // getting new Stock if ticker doesn't match
            newPortfolio = await Portfolio.findByTickerSymbol(body.ticker_symbol)
            if(!newPortfolio){
                return{
                    status: false,
                    message: `Trade cannot be made as ${body.ticker_symbol} doesn't exist in your portfolio`
                }
            }
        }

        // if Previous Trade is Sell and Current Trade is also Sell,we need to reverse previousTrade i.e BUY to SELL and SELL to BUY
        // in case of same ticker symbol or different logic will change
        if(trade.type.toUpperCase() == 'SELL' && body.type.toUpperCase() == 'SELL'){
            if(!sameTickerFlag){
                //check if Selling is feasable for new Stock or not
                if((newPortfolio.quantity-body.quantity)<0){
                    return {
                        status:false,
                        message: `Current Sell Quantity Exceeds Updated ${newPortfolio.ticker_symbol} limit if reverted!!`
                    }
                }
            }else{
                // in case of same stock check if after reverting previous trade it should be greator than equal to current selling quantity
                if((oldPortfolio.quantity+trade.quantity)<body.quantity){
                    return {
                        status:false,
                        message: `Current Sell Quantity Exceeds ${oldPortfolio.ticker_symbol} Portfolio limit if reverted!!`
                    }
                }
            }
        }
        // in case of Both BUY , Sell Old Trade and Buy New One,No need to check newTrade as its a BUY type
        else if(trade.type.toUpperCase() == 'BUY' && body.type.toUpperCase()=='BUY'){
            if((oldPortfolio.quantity-trade.quantity)<0){
                return {
                    status: false,
                    message: `Cannot undo Sell as Quantity Exceeds ${oldPortfolio.ticker_symbol} Portfolio limit!!`
                }
            }
        }
        // in case of BUY SELL trade ,prevTrade will be sold and newTrade will also be sold
        else if(trade.type.toUpperCase() == 'BUY' && body.type.toUpperCase()=='SELL'){
            if(!sameTickerFlag){
                //if its feasible to revert oldTrade
                if((oldPortfolio.quantity-trade.quantity)<0){
                    return {
                        status:false,
                        message: `Cannot undo Sell as Quantity Exceeds ${oldPortfolio.ticker_symbol} Portfolio limit!!`
                    }
                }
                //if its feasible to proceed with new Trade
                if((newPortfolio.quantity-body.quantity)<0){
                    return {
                        status:false,
                        message: `Cannot undo Sell as Quantity Exceeds ${newPortfolio.ticker_symbol} Portfolio limit!!`
                    }
                }
            }else{
                // in case of Same Ticker remove quantity after reverted trade should be more than current trade.
                if((oldPortfolio.quantity-trade.quantity)<body.quantity){
                    return {
                        status:false,
                        message: `Cannot undo Sell as Quantity Exceeds ${oldPortfolio.ticker_symbol} Portfolio limit!!`
                    }
                }
            }
        }

        // reverting a previous Trade
        var oldTrade = trade
        oldTrade.type = (oldTrade.type.toUpperCase() == "BUY")?"SELL":"BUY"
        // updating value if case of reverting Values
        oldPortfolio.avg_buy_price = utils.avgPriceAfterBuySell(oldPortfolio,oldTrade)
        oldPortfolio.quantity = oldPortfolio.quantity + parseInt(((oldTrade.type.toUpperCase()=='BUY')?oldTrade.quantity:-oldTrade.quantity))
        
        var newTrade = oldTrade
        if(!sameTickerFlag){
            //if not same stock then create a new trade and delete prevTrade
            newTrade = new Trade({
                ticker_symbol: body.ticker_symbol,
                price: trade.price,
                quantity: trade.quantity,
                type: trade.type
            })
            newPortfolio.trades.push(newTrade)

            oldPortfolio.trades = oldPortfolio.trades.filter(it=>{
                return it.toString() != trade._id.toString()
            })
            await oldTrade.delete()
        }
        newTrade.price = body.price
        newTrade.quantity = body.quantity
        newTrade.type = body.type;
        await newTrade.save()
        //updating portFolio values for new Trade
        newPortfolio.avg_buy_price = utils.avgPriceAfterBuySell(newPortfolio,newTrade)
        newPortfolio.quantity = newPortfolio.quantity + parseInt(((newTrade.type.toUpperCase()=='BUY')?newTrade.quantity:-newTrade.quantity))
        
        await oldPortfolio.save()
        await newPortfolio.save()
        
        return{
            status : true,
            message: "Edited Trade Successfully!!",
            data : {
                id : newTrade._id,
                ticker_symbol:newTrade.ticker_symbol,
                price:newTrade.price,
                quantity:newTrade.quantity,
                type:newTrade.type
            }
        }
    }catch(err){
        console.log(err)
        return{
            status : false,
            message : err.message
        }
    }
}


async function deleteTrade(trade_id){
    try{
        if(!utils.uuidRegexCheck(trade_id)){
            return{
                status: false,
                message: "Invalid ID provided!!"
            }
        }
        let trade = await Trade.findById(trade_id)
        if(!trade){
            return{
                status: false,
                message: "Trade Not Found!!"
            }
        }
        let portfolio = await Portfolio.findByTickerSymbol(trade.ticker_symbol)
        if(!portfolio){
            return{
                status: false,
                message: `Trade cannot be made as ${trade.ticker_symbol} doesn't exist in your portfolio`
            }
        }
        // in case trade was BUY i need to make sure in order to SELL the stock we have sufficient quantity
        if(trade.type.toUpperCase() == 'BUY'){
            if(portfolio && (portfolio.quantity-trade.quantity)<0){
                return {
                    status:false,
                    message: "Cannot Delete this trade due to Current Portfolio Constraints!!"
                }
            }
        }
        let oldTrade = new Trade({
            ticker_symbol: trade.ticker_symbol,
            price: trade.price,
            quantity: trade.quantity,
            type: ((trade.type.toUpperCase()=='BUY')?'SELL':'BUY')
        })

        //on deleting updating avgPrice and quantity
        portfolio.avg_buy_price = utils.avgPriceAfterBuySell(portfolio,oldTrade)
        portfolio.quantity = portfolio.quantity + parseInt(((oldTrade.type.toUpperCase()=='BUY')?oldTrade.quantity:-oldTrade.quantity))
        
        await trade.delete()
        await portfolio.save()
        return{
            status : true,
            message: "Deleted Trade Successfully!!",
            data : {
                id : trade._id,
                ticker_symbol:trade.ticker_symbol,
                price:trade.price,
                quantity:trade.quantity,
                type:trade.type
            }
        }
    }catch(err){
        console.log(err)
        return{
            status : false,
            message : err.message
        }
    }
}

async function listTrades(){
    try{
        let portfolios = await Portfolio.find().sort('ticker_symbol').populate('trades')
        let retval = []
        for(let portfolio of portfolios){
            retval.push({
                id : portfolio._id,
                ticker_symbol:portfolio.ticker_symbol,
                avg_buy_price:portfolio.avg_buy_price,
                quantity:portfolio.quantity,
                trades:portfolio.trades
            })
        }
        return{
            status :true,
            message:"Trades are Fetched Successfully!!",
            data: retval
        }
    }catch(err){
        console.log(err)
        return{
            status :false,
            message:err.message
        }
    }
}


async function listTrades2(){
    try{
        let trades = await Trade.find().sort('ticker_symbol')
        let retval = []
        for(let trade of trades){
            retval.push({
                id : trade._id,
                ticker_symbol:trade.ticker_symbol,
                price:trade.price,
                quantity:trade.quantity,
                type:trade.type
            })
        }
        return{
            status :true,
            message:"Trades are Fetched Successfully!!",
            data: retval
        }
    }catch(err){
        console.log(err)
        return{
            status :false,
            message:err.message
        }
    }
}

async function getTrade(trade_id){
    try{
        if(!utils.uuidRegexCheck(trade_id)){
            return{
                status: false,
                message: "Invalid ID provided!!"
            }
        }
        let trade = await Trade.findById(trade_id);
        if(!trade){
            return{
                status :false,
                message:"Trade not Found!!"
            }    
        }
        return{
            status :true,
            message:"Trade is Fetched Successfully!!",
            data: {
                id : trade._id,
                ticker_symbol:trade.ticker_symbol,
                price:trade.price,
                quantity:trade.quantity,
                type:trade.type
            }
        }
    }catch(err){
        console.log(err)
        return{
            status :false,
            message:err.message
        }
    }
}


module.exports = {
    addTrade,
    editTrade,
    deleteTrade,
    getTrade,
    listTrades,
    listTrades2
}