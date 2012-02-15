/*
 * GET home page.
 */

exports.show = function(req, res, main) {
    res.render('admin', { title: 'Administration', isUserCreation: main.getIsUserCreation()})
};