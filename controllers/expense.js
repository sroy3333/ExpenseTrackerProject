const Expense = require('../models/expenses');
const User = require('../models/users');
const sequelize = require('../util/database');
const UserService = require('../services/userservices');
const S3service = require('../services/S3services');
const DownloadedFile = require('../models/downloadedFile');

const downloadexpense = async (req, res) => {
    try {
    
        const expenses = await UserService.getExpenses(req);
        // Log expenses to the terminal
        console.log(expenses);
        // Convert expenses to string
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user.id;
        // Upload to S3
        const filename = `Expenses${userId}/${new Date()}.txt`;
        const fileURl = await S3service.uploadToS3(stringifiedExpenses, filename);
        
        console.log(fileURl);
        const downloadedFile = await DownloadedFile.create({ fileURl, userId: req.user.id });
        res.status(200).json({ fileURl: downloadedFile.fileURl, success: true });
    } catch(err) {
        console.log(err);
        res.status(500).json({ fileURl: '', success: false, err: err.message });
    }
}

const getDownloadedFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const downloadedFiles = await DownloadedFile.findAll({
            where: { userId },
            order: [['downloadedAt', 'DESC']], // Order by the download date
        });
        res.status(200).json({ downloadedFiles, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, err: err.message });
    }
}


const addexpense = async (req, res) => {
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0) {
        return res.status(400).json({success: false, message: 'parameters missing'} );
    }

    if(description == undefined || description.length === 0) {
        return res.status(400).json({success: false, message: 'parameters missing'} );
    }

    if(category == undefined || category.length === 0) {
        return res.status(400).json({success: false, message: 'parameters missing'} );
    }

    const t = await sequelize.transaction();

    try {
        // Create expense
        const expense = await Expense.create({ expenseamount, description, category, userId: req.user.id }, { transaction: t });

        // Update totalExpenses for the user
        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount);
        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        // Commit transaction
        await t.commit();

        // Send response
        return res.status(200).json({ expense });
    } catch (err) {
        // Rollback transaction in case of error
        await t.rollback();
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getexpenses = async (req, res) => {
    Expense.findAll().then(expenses => {
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({success: false, error: err})
        
    })
}

const deleteexpense = async (req, res) => {
    const expenseid = req.params.expenseid;
    if(expenseid == undefined || expenseid.length === 0) {
        return res.status(400).json({ success: false, message: "Expense ID is missing" });
    }

    const t = await sequelize.transaction();

    try {
        // Find the expense to delete
        const expense = await Expense.findOne({ where: { id: expenseid, userId: req.user.id } });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found or does not belong to the user" });
        }

        // Delete the expense
        await expense.destroy({ transaction: t });

        // Update totalExpenses for the user
        const totalExpense = Number(req.user.totalExpenses) - Number(expense.expenseamount);
        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        // Commit transaction
        await t.commit();

        // Send response
        return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (err) {
        // Rollback transaction in case of error
        await t.rollback();
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {
    addexpense,
    getexpenses,
    deleteexpense,
    downloadexpense,
    getDownloadedFiles
}

