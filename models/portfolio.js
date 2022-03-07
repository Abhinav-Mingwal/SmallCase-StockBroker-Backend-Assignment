const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Portfolio schema contains following fields along with validator checks
 */
let portfolioSchema = new Schema(
  {
    ticker_symbol: {
      type: String,
      unique:true,
      required:true,
      uppercase: true,
      validate:{
        validator: v=>v.length>2,
        message: props => `${props.value} ticker_symbol should be atleast 3 characters long`
      }
    },
    quantity: {
      type: Number,
      required:true,
      validate:{
        validator: v=>v>=0,
        message: props => `${props.value} Quantity cannot be less than zero`
      }
    },
    avg_buy_price: {
      type: Number,
      required:true,
    },
    trades : [
        {type: mongoose.Schema.Types.ObjectId,ref:'Trade'}
    ]
  },{
    timestamps: true 
  }
);

portfolioSchema.statics.findByTickerSymbol = function(name){
  return this.findOne({ticker_symbol: new RegExp(name,'i')})
}

portfolioSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

portfolioSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model("Portfolio", portfolioSchema);