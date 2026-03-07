import 'dotenv/config';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function test() {
    try {
        console.log('Testing Razorpay with Key ID:', process.env.RAZORPAY_KEY_ID);
        const options = {
            amount: 100, // 1 INR in paise
            currency: 'INR',
            receipt: 'test_receipt'
        };
        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order);
    } catch (error) {
        console.error('Error creating Razorpay order:');
        console.error(JSON.stringify(error, null, 2));
    }
}

test();
