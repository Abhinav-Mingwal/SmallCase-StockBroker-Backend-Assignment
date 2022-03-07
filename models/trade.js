const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let tradeSchema = new Schema(
  {
    ticker_symbol: {
      type: String,
      uppercase: true,
      validate:{
        validator: v=>v.length>2,
        message: props => `${props.value} ticker_symbol should be atleast 3 characters long`
      }
    },
    price: {
      type: Number,
      validate:{
        validator: v=>v>0,
        message: props => `Your price is ${props.value} it cannot be less than or equal to zero`
      }
    },
    quantity: {
      type: Number,
      validate:{
        validator: v=>v>0,
        message: props => `Your quantity is ${props.value} it cannot be less than or equal to zero`
      }
    },
    type:{
        type: String,
        enum : {
          values: ['BUY', 'SELL'],
          message: "type can only be 'BUY' or 'SELL'"
        },
        validate:{
          validator: v=>(v.toUpperCase() == 'BUY' || v.toUpperCase() == 'SELL'),
          message: props => `type can only be 'BUY' or 'SELL'`
        }
    }
  },
  { 
        timestamps: true 
    }
);

tradeSchema.statics.findByTickerSymbol = function(name){
  return this.where({ticker_symbol: new RegExp(name,i)})
}

tradeSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

tradeSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model("Trade", tradeSchema);