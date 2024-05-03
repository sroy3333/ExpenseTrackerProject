
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const resetpasswordRoutes = require('./routes/resetpassword');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');
const premiumFeatureRoutes = require('./routes/premiumFeature');
const DownloadedFile = require('./models/downloadedFile');
const cors = require('cors');

const app = express();


dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);
app.use('/password', resetpasswordRoutes);


User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadedFile);
DownloadedFile.belongsTo(User);

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup', 'signup.html'));
});

app.get('/ExpenseTracker/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ExpenseTracker', 'index.html'));
});

app.get('/ForgotPassword/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ForgotPassword', 'index.html'));
});


sequelize
  .sync()
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });