const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs') // 引入 fs 模組 https://ithelp.ithome.com.tw/articles/10185422
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Category = db.Category
const adminService = require('../services/adminService.js')

const adminController = {
    // 抽取成 services 模組
    getRestaurants: (req, res) => {
        adminService.getRestaurants(req, res, (data => {
            return res.render('admin/restaurants', data)
        }))
    },

    createRestaurant: (req, res) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return res.render('admin/create', {
                categories: categories
            })
        })
    },

    // 抽取成 services 模組
    postRestaurant: (req, res) => {
        adminService.postRestaurant(req, res, (data) => {
            if (data['status'] === 'error') {
                req.flash('error_messages', data['message'])
                return res.redirect('back')
            }
            req.flash('success_messages', data['message'])
            res.redirect('/admin/restaurants')
        })
    },

    // 抽取成 services 模組
    getRestaurant: (req, res) => {
        adminService.getRestaurant(req, res, (data => {
            return res.render('admin/restaurant', data)
        }))
    },

    editRestaurant: (req, res) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return Restaurant.findByPk(req.params.id).then(restaurant => {
                return res.render('admin/create', {
                    categories: categories,
                    restaurant: restaurant.toJSON()
                })
            })
        })
    },

    putRestaurant: (req, res) => {
        if (!req.body.name) {
            req.flash('error_messages', "name didn't exist")
            return res.redirect('back')
        }

        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            // https://www.itread01.com/content/1546458842.html
            imgur.upload(file.path, (err, img) => {
                return Restaurant.findByPk(req.params.id)
                    .then((restaurant) => {
                        // test console.log('-------------------------')
                        // test console.log(img)
                        restaurant.update({
                            name: req.body.name,
                            tel: req.body.tel,
                            address: req.body.address,
                            opening_hours: req.body.opening_hours,
                            description: req.body.description,
                            image: file ? img.data.link : restaurant.image,
                            CategoryId: req.body.categoryId
                        })
                            .then((restaurant) => {
                                req.flash('success_messages', 'restaurant was successfully to update')
                                res.redirect('/admin/restaurants')
                            })
                    })
            })
        }
        else {
            return Restaurant.findByPk(req.params.id)
                .then((restaurant) => {
                    restaurant.update({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: restaurant.image,
                        CategoryId: req.body.categoryId
                    })
                        .then((restaurant) => {
                            req.flash('success_messages', 'restaurant was successfully to update')
                            res.redirect('/admin/restaurants')
                        })
                })
        }
    },

    // 抽取成 services 模組
    deleteRestaurant: (req, res) => {
        adminService.deleteRestaurant(req, res, (data) => {
            if (data['status'] === 'success') {
                return res.redirect('/admin/restaurants')
            }
        })
    },

    getUsers: (req, res, next) => {
        User.findAll({ raw: true })
            .then((users) => {
                return res.render('admin/users', { users })
            })
            .catch(err => next(err))
    },

    toggleAdmin: (req, res, next) => {
        const id = req.params.id
        User.findByPk(id)
            .then((user) => {
                if (user.isAdmin) {
                    return user.update({ isAdmin: false })
                    // 沒加 return 畫面不會即時更新 
                } else {
                    return user.update({ isAdmin: true })
                }
            })
            .then(() => {
                return res.redirect('/admin/users')
            })
            .catch(err => next(err))

    },
}

module.exports = adminController