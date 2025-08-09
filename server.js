const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const port = process.env.PORT ; 


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();


app.use('/api/toys', require('./Routes/toy.routes'));
app.use('/api/users', require('./Routes/user.routes'));
app.use('/api/cart', require('./Routes/cart.routes'));
app.use('/api/order', require('./Routes/order.routes'));


app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
