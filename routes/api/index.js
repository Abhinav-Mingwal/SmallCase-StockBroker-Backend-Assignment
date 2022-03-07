const { Router } = require('express')
const { getReturns } = require('../../controller/portfolio')
const route = Router()


route.use('/portfolio',require('./portfolio'))
route.use('/trade', require('./trade'))

route.get('/returns', async(req,res)=>{
    try{
        var returns = await getReturns();
        res.status(returns.status?200:400).json(returns)
    }catch(err){
        console.log(err)
        res.status(400).json({
            status : false,
            message : "Something went wrong,please try again after sometime!!",
          })
    }
})

route.get('/',(req,res)=>{
    res.status(404).json({
        status : false,
        message : "Following are the list of routes for this API: 1. '/trade'[POST][GET] 2. '/trade/:trade_id'[PUT,GET,DELETE]  3. '/portfolio/:portfolio_id [GET]' 4. '/portfolio/ [GET]' 4. '/returns'[GET]",
        error : ""
    })
})


module.exports = route