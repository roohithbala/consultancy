import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { subject, description, priority, orderId } = req.body;

        const ticket = await Ticket.create({
            user: req.user._id,
            order: orderId || undefined,
            subject,
            description,
            priority: priority || 'Medium'
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user tickets
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private/Admin
const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({}).populate('user', 'name email').populate('order', '_id').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('replies.user', 'name email');

        if (ticket) {
            // Check if user is admin or the ticket belongs to the user
            if (req.user.role === 'admin' || ticket.user._id.toString() === req.user._id.toString()) {
                res.json(ticket);
            } else {
                res.status(401).json({ message: 'Not authorized to view this ticket' });
            }
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reply to a ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
const replyToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (ticket) {
             if (req.user.role === 'admin' || ticket.user.toString() === req.user._id.toString()) {
                 const reply = {
                     user: req.user._id,
                     message,
                     isAdmin: req.user.role === 'admin'
                 };
                 
                 ticket.replies.push(reply);
                 
                 // If admin replies, status could be changed to 'In Progress' if it was 'Open'
                 if (req.user.role === 'admin' && ticket.status === 'Open') {
                     ticket.status = 'In Progress';
                 }
                 
                 await ticket.save();
                 
                 // Refetch to get populated user data
                 const updatedTicket = await Ticket.findById(req.params.id)
                     .populate('user', 'name email')
                     .populate('replies.user', 'name email');
                     
                 res.status(201).json(updatedTicket);
             } else {
                 res.status(401).json({ message: 'Not authorized to reply to this ticket' });
             }
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (ticket) {
            ticket.status = status;
            const updatedTicket = await ticket.save();
            res.json(updatedTicket);
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    createTicket,
    getMyTickets,
    getTickets,
    getTicketById,
    replyToTicket,
    updateTicketStatus
};
