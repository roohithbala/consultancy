import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: ['Raw Materials', 'Logistics', 'Utilities', 'Salaries', 'Marketing', 'Maintenance', 'Taxes', 'Other'],
        default: 'Other'
    },
    date: { type: Date, default: Date.now },
    reference: { type: String },       // bill number / invoice number
    vendor: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
