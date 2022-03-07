const { Router } = require('express')
const route = Router()

var {
  addTrade,
  editTrade,
  deleteTrade,
  getTrade,
  listTrades,
  listTrades2,
} = require("../../controller/trades")

route.post('/', async (req, res) => {
    try {
        var trade = await addTrade(req.body);
        res.status(trade.status?201:400).json(trade)
    } catch (err) {
      console.log(err)
      res.status(400).json({
        status : false,
        message : "Something went wrong,please try again after sometime!!",
      })
    }
  })

route.put('/:trade_id', async (req, res) => {
  try {
    var trade = await editTrade(req.params.trade_id,req.body);
    res.status(trade.status?200:400).json(trade)
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status : false,
      message : "Something went wrong,please try again after sometime!!",
    })
  }
})

route.delete('/:trade_id', async (req, res) => {
  try {
    var trade = await deleteTrade(req.params.trade_id);
    res.status(trade.status?200:400).json(trade)
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status : false,
      message : "Something went wrong,please try again after sometime!!",
    })
  }
})


route.get('/list', async (req, res) => {
  try {
    var trade = await listTrades2();
    res.status(trade.status?200:400).json(trade)
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status : false,
      message : "Something went wrong,please try again after sometime!!",
    })
  }
})

route.get('/:trade_id', async (req, res) => {
  try {
    var trade = await getTrade(req.params.trade_id);
    res.status(trade.status?200:400).json(trade)
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status : false,
      message : "Something went wrong,please try again after sometime!!",
    })
  }
})


route.get('/', async (req, res) => {
  try {
    var trade = await listTrades();
    res.status(trade.status?200:400).json(trade)
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status : false,
      message : "Something went wrong,please try again after sometime!!",
    })
  }
})

module.exports = route