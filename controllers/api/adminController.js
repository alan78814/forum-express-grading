const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = require('../../services/adminService.js')
const adminController = {
    getRestaurants: (req, res) => {
        adminService.getRestaurants(req, res, (data) => {
            return res.json(data) // https://www.itread01.com/content/1544582363.html
        })
    },

    getRestaurant: (req, res) => {
        adminService.getRestaurant(req, res, (data) => {
            return res.json(data)
        })
    },

    deleteRestaurant: (req, res) => {
        adminService.deleteRestaurant(req, res, (data) => {
            return res.json(data)
        })
    },

    postRestaurant: (req, res) => {
        adminService.postRestaurant(req, res, (data) => {
            return res.json(data)
        })
    },

    putRestaurant: (req, res) => {
        adminService.putRestaurant(req, res, (data) => {
            return res.json(data)
        })
    },
}
module.exports = adminController