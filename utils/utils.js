module.exports={
    uuidRegexCheck : (value)=>{
        var regex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
        return regex.test(value)
    },
    tradeValidator: (body)=>{
        if(body.ticker_symbol==null){
            return{
                status : false,
                message : "Stock Name missing"
            }
        }
        if(body.price==null){
            return{
                status : false,
                message : "price missing"
            }
        }
        if(body.price!=null && body.price<=0){
            return{
                status : false,
                message : "Price cannot be Negative or Zero"
            }
        }
        if(body.quantity==null){
            return{
                status : false,
                message : "quantity missing"
            }
        }
        if(body.quantity<=0){
            return{
                status : false,
                message : "Quantity cannot be Negative or Zero"
            }
        }
        if(body.type==null){
            return{
                status : false,
                message : "type missing"
            }
        }
        if(!(body.type.toUpperCase()=='SELL' || body.type.toUpperCase() == 'BUY')){
            return{
                status : false,
                message : "type can only be SELL or BUY"
            }
        }
        return null;
    },
    avgPriceAfterBuySell:(portfolio,currentTrade)=>{
        if(currentTrade.type.toUpperCase() == 'BUY'){
            return (((portfolio.quantity*portfolio.avg_buy_price)+(currentTrade.quantity*currentTrade.price))/(portfolio.quantity+currentTrade.quantity))
        }else{
            if(portfolio.quantity == currentTrade.quantity){
                return 0;
            }else{
                return ((Math.abs((portfolio.quantity*portfolio.avg_buy_price)-(currentTrade.quantity*currentTrade.price)))/(portfolio.quantity-currentTrade.quantity))
            }
        }
    }
}