require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());

// import schedule
const schedulePromotion = require('./middlewares/schedulePromotion');

// run schedule
schedulePromotion.updatePriceDiscount.start();

// Routes
app.use('/user', require('./routes/userRouter'));
app.use('/admin', require('./routes/adminRouter'));
app.use('/categories', require('./routes/categoriesRouter'));
app.use('/products', require('./routes/productRouter'));
app.use('/rated', require('./routes/ratedRouter'));
app.use('/cart', require('./routes/cartRouter'));
app.use('/order', require('./routes/orderRouter'));
app.use('/warehouse', require('./routes/warehouseRouter'));
app.use('/promotion', require('./routes/promotionRouter'));
app.use('/contact', require('./routes/contactRouter'));
app.use('/revenue', require('./routes/revenueRouter'));
app.use('/address', require('./routes/addressRouter'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("Connected to MongoDB")).catch((err) => console.log("Failed to connect to MongoDB: ", err));

app.get('/', (req, res) => {
    res.json({ "message": "Hello World! Welcome to my project." });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
