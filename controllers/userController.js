const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Favorite = db.Favorite
const Followship = db.Followship
const Like = db.Like
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Comment = db.Comment
const Restaurant = db.Restaurant

const userController = {
    signUpPage: (req, res) => {
        return res.render('signup')
    },

    signUp: (req, res) => {
        if (req.body.passwordCheck !== req.body.password) {
            req.flash('error_messages', '兩次密碼輸入不同！')
            return res.redirect('/signup')
        } else {
            // confirm unique user
            User.findOne({ where: { email: req.body.email } }).then(user => {
                if (user) {
                    req.flash('error_messages', '信箱重複！')
                    return res.redirect('/signup')
                } else {
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                    }).then(user => {
                        req.flash('success_messages', '成功註冊帳號！')
                        return res.redirect('/signin')
                    })
                }
            })
        }
    },

    signInPage: (req, res) => {
        return res.render('signin')
    },

    signIn: (req, res) => {
        req.flash('success_messages', '成功登入！')
        res.redirect('/restaurants')
    },

    logout: (req, res) => {
        req.flash('success_messages', '登出成功！')
        req.logout()
        res.redirect('/signin')
    },

    addFavorite: (req, res) => {
        return Favorite.create({
            UserId: helpers.getUser(req).id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
            })
    },

    removeFavorite: (req, res) => {
        return Favorite.findOne({
            where: {
                UserId: helpers.getUser(req).id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        return res.redirect('back')
                    })
            })
    },

    getTopUser: (req, res) => {
        // 撈出所有 User 與 followers 資料
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            // 整理 users 資料，users 為一陣列，...user.dataValue 把 user.dataValue(一物件) 的 key-value pair 展開，最後users為一陣列內有許多物件
            users = users.map(user => ({
                ...user.dataValues,
                // 計算追蹤者人數,為物件中新的 key-value
                FollowerCount: user.Followers.length,
                // 判斷目前登入使用者是否已追蹤該 User 物件，為物件中新的 key-value
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            // 依追蹤者人數排序清單
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
            return res.render('topUser', { users: users })
        })
    },

    addFollowing: (req, res) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
            .then((followship) => {
                return res.redirect('back')
            })
    },

    addLike: (req, res) => {
        return Like.create({
            UserId: helpers.getUser(req).id,
            RestaurantId: req.params.restaurantId
        })
            .then(() => {
                return res.redirect('back')
            })
    },

    removeLike: (req, res) => {
        return Like.findOne({
            where: {
                UserId: helpers.getUser(req).id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((like) => {
                like.destroy()
                    .then(() => {
                        return res.redirect('back')
                    })
            })
    },

    removeFollowing: (req, res) => {
        return Followship.findOne({
            where: {
                followerId: req.user.id,
                followingId: req.params.userId
            }
        })
            .then((followship) => {
                followship.destroy()
                    .then((followship) => {
                        return res.redirect('back')
                    })
            })
    },

    removeLike: (req, res) => {
        return Like.findOne({
            where: {
                UserId: helpers.getUser(req).id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((like) => {
                like.destroy()
                    .then(() => {
                        return res.redirect('back')
                    })
            })
    },

    getUser: (req, res, next) => {
        const userId = Number(req.params.id)
        User.findAndCountAll({
            include: [{ model: Comment, include: [Restaurant] }],
            where: { id: userId }
        })
            .then((user) => {
                return res.render('profile', {
                    user: user.rows[0].toJSON(),
                    count: user.rows[0].Comments.length // count 直接使用 findAndCountAll 之 count 當沒評論時會顯示1
                })
            })
            .catch(err => next(err))
    },

    editUser: (req, res, next) => {
        if ((helpers.getUser(req).id) !== Number(req.params.id)) {
            req.flash('error_messages', "can not change other's profile")
            return res.redirect(`/users/${req.user.id}`)
        }

        User.findByPk(req.params.id)
            .then((user) => {
                return res.render('editProfile', { user: user.toJSON() })
            })
            .catch(err => next(err))
    },

    putUser: (req, res, next) => {
        if (!req.body.name) {
            req.flash('error_messages', "name didn't exist")
            return res.redirect('back')
        }

        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.params.id)
                    .then((user) => {
                        user.update({
                            name: req.body.name,
                            image: file ? img.data.link : user.image,
                        })
                            .then(() => {
                                req.flash('success_messages', 'user was successfully to update')
                                res.redirect(`/users/${req.params.id}`)
                            })
                    })
                    .catch(err => next(err))
            })
        }
        else {
            return User.findByPk(req.params.id)
                .then((user) => {
                    user.update({
                        name: req.body.name,
                        image: null,
                    })
                        .then(() => {
                            req.flash('success_messages', 'user was successfully to update')
                            res.redirect(`/users/${req.params.id}`)
                        })
                })
                .catch(err => next(err))
        }
    },
}

module.exports = userController