const Portfolio = require("../models/portfolio")
const utils = require("../utils/utils")

async function getPortfolio(portfolio_id){
    try{
        // regex check for document ID
        if(!utils.uuidRegexCheck(portfolio_id)){
            return{
                status: false,
                message: "Invalid ID provided!!"
            }
        }
        let port = await Portfolio.findById(portfolio_id);
        return{
            status :true,
            message:"Portfolio is Fetched Successfully!!",
            data: {
                id:port._id,
                ticker_sysmbol:port.ticker_symbol,
                quantity:port.quantity,
                avg_buy_price: (port.avg_buy_price).toFixed(2),
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


async function listPortfolio(){
    try{
        let ports = await Portfolio.find().sort('ticker_symbol');
        let retval = []
        for(let port of ports){
            retval.push({
                id:port._id,
                ticker_sysmbol:port.ticker_symbol,
                quantity:port.quantity,
                avg_buy_price: (port.avg_buy_price).toFixed(2),
            })
        }
        return{
            status :true,
            message:"Portfolio is Fetched Successfully!!",
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

async function getReturns(){
    try{
        let ports = await Portfolio.find();
        let val = 0;
        for(let port of ports){
            //val+=(currentPrice-avgBuyPrice)*quantity of stocks
            val+=(100-port.avg_buy_price)*port.quantity
        }
        return{
            status:true,
            message:`your Cummulaive Return is ${val}`,
            data: val
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
    getPortfolio,
    listPortfolio,
    getReturns
}