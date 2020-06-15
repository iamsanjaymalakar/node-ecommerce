module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.session.redirectTo = req.originalUrl;
        req.session.save(err => {
            if (err)
                console.log(err);
            res.redirect('/login');
        });
    } else {
        next();
    }
}