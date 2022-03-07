const { Router } = require('express')
const route = Router()
const{
  getPortfolio,
  listPortfolio
} = require("../../controller/portfolio")

route.get('/:portfolio_id', async (req, res) => {
  try {
    var ports = await getPortfolio(req.params.portfolio_id);
    res.status(ports.status?200:400).json(ports)
} catch (err) {
  console.log(err)
  res.status(400).json({
    status : false,
    message : "Something went wrong,please try again after sometime!!"
  })
}
})

route.get('/', async (req, res) => {
  try {
    var ports = await listPortfolio();
    res.status(ports.status?200:400).json(ports)
} catch (err) {
  console.log(err)
  res.status(400).json({
    status : false,
    message : "Something went wrong,please try again after sometime!!"
  })
}
})

module.exports = route