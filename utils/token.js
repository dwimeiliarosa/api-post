const jwt = require('jsonwebtoken');



const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;



function generateAccessToken(user) {

  return jwt.sign(

    { id: user.id, email: user.email },

    ACCESS_TOKEN_SECRET,

    { expiresIn: '15m' }

  );

}



function generateRefreshToken(user) {

  return jwt.sign(

    { id: user.id },

    REFRESH_TOKEN_SECRET,

    { expiresIn: '7d' }

  );

}



module.exports = {

  generateAccessToken,

  generateRefreshToken,

  ACCESS_TOKEN_SECRET,

  REFRESH_TOKEN_SECRET

};