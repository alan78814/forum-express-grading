let routes = require('./routes') // module.exports = router
let apis = require('./apis')

module.exports = (app) => {
  // 會對 '/' 路徑上任何類型的 HTTP 要求，執行routes -> require('./routes') -> 執行routes.js的程式碼 -> 分流後的路由是透過 router 來操作的
  app.use('/', routes)
  app.use('/api', apis)
}