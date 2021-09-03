const helpers = require('../_helpers')
const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }


  // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  // 渲染新增餐廳頁面的路由
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  // 後台新增餐廳的路由
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  // 顯示單一餐廳
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  // 渲染編輯頁面
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  // 後台編輯餐廳的路由
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  // 刪除餐廳
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  // 顯示使用者清單
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  // 修改使用者權限
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
  // 瀏覽分類
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  // 新增分類
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
  // 瀏覽分類 有id
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  // 編輯分類 edit
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
  // 刪除分類
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)
  // 刪除評論
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
  // 追蹤功能
  app.post('/following/:userId', authenticated, userController.addFollowing)
  app.delete('/following/:userId', authenticated, userController.removeFollowing)

  // 前台
  //如果使用者訪問首頁，就導向 /restaurants 的頁面
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  //在 /restaurants 底下則交給 restController.getRestaurants 來處理
  app.get('/restaurants', authenticated, restController.getRestaurants)
  // 最新動態
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  // 前台瀏覽餐廳個別資料 
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  // 新增評論
  app.post('/comments', authenticated, commentController.postComment)
  // 點擊前往dashboard 頁面
  app.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
  // 加入最愛
  app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  // 移除最愛
  app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
  // 美食達人，和 A19合併後記得更改位置:https://lighthouse.alphacamp.co/courses/118/units/25628
  app.get('/users/top', authenticated, userController.getTopUser)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  // 新增登入以及登出的路由：
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true /* 可以得到為什麼失敗的訊息 */ }), userController.signIn)
  app.get('/logout', userController.logout)
}

// module.exports = function (app) {
//   app.get('/', (req, res) => res.redirect('/restaurants'))
//   //在 /restaurants 底下則交給 restController.getRestaurants 來處理
//   app.get('/restaurants', restController.getRestaurants)
// }

