const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetToken : {
        type : String
    },
    resetTokenExp : {
        type: Date
    },
    cart : {
        items : [
            {
                product : {
                    type : String,
                    required : true
                },
                quantity : {
                    type : Number,
                    required : true
                }
            }
        ]
    }
});


module.exports = mongoose.model('User',userSchema);