const multer = require('multer');

const cloudinary = require('cloudinary').v2;

const Product = require('../models/productSchema');

const Authenticated = require('../models/authenticated');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('imageUrl');

exports.createProduct = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error uploading file' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image'
      });

      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        productId: req.body.productId,
        quantity: req.body.quantity,
        expiryDate: req.body.expiryDate,
        barcode: req.body.barcode,
        category: req.body.category,
        manufacturer: req.body.manufacturer,
        imageUrl: result.secure_url
      });

      await product.save();

      res.status(201).json({ message: 'Product created successfully', product: product });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const userAgent = req.headers['user-agent'];

    const product = await Product.findById(productId).populate({
      path: 'manufacturer',
      select: 'name contractAddress'
    });

    const productName = product.name;
    let status;
    if (product) {
      status = 'passed';
    } else {
      status = 'failed';
    }

    const authenticatedProduct = new Authenticated({
      product: productName,
      productId: productId,
      requester: userAgent,
      status: status
    });

    await authenticatedProduct.save();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const totalAuthentications = await Authenticated.countDocuments({
      product: productName
    });

    const authdocs = await Authenticated.find({ product: productName });

    res.status(200).json({
      message: 'Product found',
      product: product,
      totalAuthentications: totalAuthentications,
      authdocs: authdocs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getTotalProducts = async (req, res, next) => {
    try {
        const manufacturerId = req.user.userId; 
        const totalProducts = await Product.countDocuments({ manufacturer: manufacturerId });

        res.status(200).json({ message: 'Total products retrieved', totalProducts: totalProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCategories = async (req, res, next) => {
  try {
    const manufacturerId = req.user.userId;

    const products = await Product.find({ manufacturer: manufacturerId }).select('category');

    const categoryIds = [...new Set(products.map(product => product.category))];

    const categories = await Category.aggregate([
      { $match: { _id: { $in: categoryIds } } },
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 }
        }
      }
    ]);

    const categoriesData = await Category.find({ _id: { $in: categoryIds } });

    const categoriesWithProductsCount = categoriesData.map(category => {
      const categoryProductCount = products.filter(product => product.category.toString() === category._id.toString()).length;
      return {
        _id: category._id,
        name: category.name,
        description: category.description,
        productCount: categoryProductCount
      };
    });

    res.status(200).json({ message: 'Categories retrieved', totalCategories: categories[0]?.totalCategories || 0, categories: categoriesWithProductsCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




