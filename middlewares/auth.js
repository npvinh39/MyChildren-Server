const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        if (!req.headers['authorization']) return res.status(400).json({ msg: "Invalid Authentication" });
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
            if (err) return res.status(400).json({ msg: "Invalid Authentication" });

            req.user = user;
            // console.log(req.user);
            next();
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

module.exports = auth;