const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

let categoryController = {
    // 抽取成service模組
    getCategories: (req, res) => {
        categoryService.getCategories(req, res, (data => {
            return res.render('admin/categories', data)
            // 注意不是/admin/categories
        }))
    },

    // 抽取成service模組
    postCategory: (req, res) => {
        categoryService.postCategory(req, res, (data) => {
            if (data['status'] === 'error') {
                req.flash('error_messages', 'name didn\'t exist')
                return res.redirect('back')
            }
            req.flash('success_messages', data['message'])
            res.redirect('/admin/categories')
        })
    },

    // 抽取成service模組
    putCategory: (req, res) => {
        categoryService.putCategory(req, res, (data) => {
            if (data['status'] === 'error') {
                req.flash('error_messages', 'name didn\'t exist')
                return res.redirect('back')
            }
            req.flash('success_messages', data['message'])
            res.redirect('/admin/categories')
        })
    },

    deleteCategory: (req, res) => {
        return Category.findByPk(req.params.id)
            .then((category) => {
                category.destroy()
                    .then((category) => {
                        res.redirect('/admin/categories')
                    })
            })
    },


}

module.exports = categoryController