import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    const products = await Product.find({});
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    const {
        name,
        description,
        materialType,
        pricePerMeter,
        imageUrl,
        textureMaps,
        inStock,
        width,
        gsm,
        documents,
        samplePrice,
        coatings
    } = req.body;


    const product = new Product({
        name,
        description,
        materialType,
        pricePerMeter,
        imageUrl,
        textureMaps,
        inStock,
        width,
        gsm,
        documents,
        samplePrice,
        coatings,
        user: req.user._id
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    const {
        name,
        description,
        materialType,
        pricePerMeter,
        imageUrl,
        textureMaps,
        inStock,
        width,
        gsm,
        documents,
        samplePrice,
        coatings
    } = req.body;


    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.materialType = materialType || product.materialType;
        product.pricePerMeter = pricePerMeter || product.pricePerMeter;
        product.imageUrl = imageUrl || product.imageUrl;
        product.textureMaps = textureMaps || product.textureMaps;
        product.inStock = inStock || product.inStock;
        product.width = width || product.width;
        product.gsm = gsm || product.gsm;
        product.documents = documents || product.documents;
        product.samplePrice = samplePrice || product.samplePrice;
        product.coatings = coatings || product.coatings;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Add a new question to a product
// @route   POST /api/products/:id/questions
// @access  Private
export const addProductQuestion = async (req, res) => {
    const { question } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
        const newQuestion = {
            user: req.user._id,
            question
        };

        product.questions.push(newQuestion);
        await product.save();
        
        // Return the updated product or just the questions
        // Easiest is to return message and updated product
        res.status(201).json({ message: 'Question added', questions: product.questions });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Answer a product question
// @route   PUT /api/products/:id/questions/:questionId
// @access  Private/Admin
export const answerProductQuestion = async (req, res) => {
    const { answer } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
        const questionObj = product.questions.id(req.params.questionId);
        
        if (questionObj) {
            questionObj.answer = answer;
            questionObj.answeredBy = req.user._id;
            questionObj.answeredAt = Date.now();
            
            await product.save();
            res.json({ message: 'Question answered', questions: product.questions });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

