const jwt = require("jsonwebtoken");

function create(user) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        process.env.JWT_SECRET_TOKEN,
        {expiresIn: "7d"}
    );
}

function verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET_TOKEN);
}

module.exports = {
    create,
    verify
};