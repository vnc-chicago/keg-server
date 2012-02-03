/*
 * GET home page.
 */

exports.show = function(req, res) {
    res.render('admin', { title: 'Administration' })
};