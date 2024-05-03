const Razorpay = require('razorpay');
const Order = require('../models/orders');
const uuid = require('uuid');
const userController = require('../controllers/user');
const { json } = require('body-parser');


const purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500;

        rzp.orders.create({amount, currency: 'INR'}, (err, order) => {
            if(err) {
                throw new Error(json.stringfy(err));
            }
            const orderId = uuid.v4();
            req.user.createOrder({ id: orderId, orderid: order.id, status: 'PENDING'}).then(() => {
                return res.status(201).json({ order, key_id : rzp.key_id});
            
            }).catch(err => {
                throw new Error(err)
            })
        })
    } catch(err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err})
    }
}

const updateTransactionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { payment_id, order_id} = req.body;
        const order = await Order.findOne({where : {orderid : order_id}})
            const promise1 = order.update({ paymentid: payment_id, status: 'SUCCESSFUL'})
            const promise2 = req.user.update({ ispremiumuser: true })

            Promise.all([promise1, promise2]).then(() => {
                return res.status(202).json({success: true, message: "Transaction Successful", token: userController.generateAccessToken(userId,undefined , true) });
            }).catch((error) => {
                throw new Error(error)
            })
            
                
    } catch(err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err})
    }
}

module.exports = {
    purchasepremium,
    updateTransactionStatus,
    Order
}