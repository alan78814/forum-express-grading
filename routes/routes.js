const helpers = require('../_helpers')
const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

// 引用 Express 與 Express 路由器
const express = require('express');
const router = express.Router();
const passport = require('../config/passport')


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
router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
// 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
// 渲染新增餐廳頁面的路由
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
// 後台新增餐廳的路由
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
// 顯示單一餐廳
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
// 渲染編輯頁面
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
// 後台編輯餐廳的路由
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
// 刪除餐廳
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
// 顯示使用者清單
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
// 修改使用者權限
router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
// 瀏覽分類
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
// 新增分類
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
// 瀏覽分類 有id
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
// 編輯分類 edit
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
// 刪除分類
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)
// 刪除評論
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
// 追蹤功能
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

// 前台
//如果使用者訪問首頁，就導向 /restaurants 的頁面
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
//在 /restaurants 底下則交給 restController.getRestaurants 來處理
router.get('/restaurants', authenticated, restController.getRestaurants)
// 最新動態
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
// 前台瀏覽餐廳個別資料 
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
// 新增評論
router.post('/comments', authenticated, commentController.postComment)
// 點擊前往dashboard 頁面
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
// 加入最愛
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
// 移除最愛
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
// 美食達人，和 A19合併後記得更改位置:https://lighthouse.alphacamp.co/courses/118/units/25628
router.get('/users/top', authenticated, userController.getTopUser)
// 加入like
router.post('/like/:restaurantId', authenticated, userController.addLike)
// 移除like
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
// 瀏覽 Profile
router.get('/users/:id', authenticated, userController.getUser)
// 瀏覽編輯 Profile 頁面
router.get('/users/:id/edit', authenticated, userController.editUser)
//  編輯 Profile
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)


router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
// 新增登入以及登出的路由：
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true /* 可以得到為什麼失敗的訊息 */ }), userController.signIn)
router.get('/logout', userController.logout)

// 匯出路由器
module.exports = router

// module.exports = function (router) {
//   router.get('/', (req, res) => res.redirect('/restaurants'))
//   //在 /restaurants 底下則交給 restController.getRestaurants 來處理
//   router.get('/restaurants', restController.getRestaurants)
// }

