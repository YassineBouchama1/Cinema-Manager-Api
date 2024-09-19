


// //@Desc This Class is responsible about operition error (error that i can predect) {make eror easy to ready}
// // More Desc : extand from clas error that vuilt in in js and predect it for our error
class ApiError extends Error {
    constructor(message, statusCode) {

        super(message)
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
        this.isOperational = true
    }
}
module.exports = ApiError

