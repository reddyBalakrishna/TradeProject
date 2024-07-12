const rateLimit = require('express-rate-limit');

exports.logInLimiter= rateLimit({
    windowMs:120*1000,
    max:3,
    handler:(req,res,next)=>{
        let err =new Error('Too Many login requests. Try after some time');
        err.status=429;
        return next(err);
    }
})