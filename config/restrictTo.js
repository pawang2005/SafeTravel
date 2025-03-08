function restrictTo(role = []) {
    return function (req, res, next) {
        if (!req.user) return res.redirect('/login');
        if (!role.includes(req.user.role)) return res.status(403).send("Unauthorized");

        return next();
    }
}

module.exports = {
    restrictTo,
}