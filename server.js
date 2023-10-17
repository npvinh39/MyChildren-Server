require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// import schedule
const schedulePromotion = require('./middlewares/schedulePromotion');

// run schedule
schedulePromotion.updatePriceDiscount.start();

// Routes
app.use('/api/user', require('./routes/userRouter'));
app.use('/api/admin', require('./routes/adminRouter'));
app.use('/api/categories', require('./routes/categoriesRouter'));
app.use('/api/products', require('./routes/productRouter'));
app.use('/api/rated', require('./routes/ratedRouter'));
app.use('/api/cart', require('./routes/cartRouter'));
app.use('/api/order', require('./routes/orderRouter'));
app.use('/api/warehouse', require('./routes/warehouseRouter'));
app.use('/api/promotion', require('./routes/promotionRouter'));
app.use('/api/contact', require('./routes/contactRouter'));
app.use('/api/revenue', require('./routes/revenueRouter'));
app.use('/api/address', require('./routes/addressRouter'));

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
