/*
 * GET home page.
 */

exports.show = function(req, res) {
    res.render('index', { title: 'Express' })
};