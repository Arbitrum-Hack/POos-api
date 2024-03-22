const _ = require('lodash');

const User = require('../models/manufacturer');

const config = require('config');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const conFig = require('../configure');

exports.createUser = async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });

        if (user) {
            const error = new Error('User already exists.');
            error.statusCode = 422;
            throw error;
        }

        const newUser = new User(_.pick(req.body, ['name', 'email', 'industry', 'password', 'address', 'idNumber' ]));
        
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        const result = await newUser.save();

        const pickedUser = _.pick(result, ['_id', 'name', 'email']);
        res.status(201).json({ 
            message: "User created successfully",
            user: pickedUser
        });
    } catch (err) {
        if (!err.statusCode) {
            console.log(err.message);
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.verifyEmailWithToken = async (req, res) => {
    const token = req.params.token;

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const userId = decoded.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isEmailVerified = true;
        await user.save();
        return res.status(200).json({ message: "Email verified" });
    } catch (error){
        
        res.status(400).json({ message: 'Invalid or expired token' });
    }

}


exports.getUsers = (req, res, next) => {
User.find()
.then(user => {
    res.status(200).json({message: 'User fetched successfully', user: user})
})
.catch( err =>{
    if (!err.statusCode){
        err.statusCode = 500;
    }
    next(err)
})
}


exports.sendMailToUser = async (req, res, next) => {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
    }
    console.log("key:",config.get('jwtPrivateKey'))
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        config.get('jwtPrivateKey'),
        { expiresIn: '1h' } 
    );

    const loginLink = `http://your_domain/login?token=${token}`;

    const transporter = nodemailer.createTransport({
        
        service: 'gmail',
        auth: {
            user: conFig.hostMailAddress,
            pass: conFig.hostPass,
        },
        debug : true

    });

    const mailOptions = {
        from: `"POosystem" <${conFig.hostMailAddress}>`,
        to: user.email,
        subject: 'POos Email Verification Link',
        text: `Click on the link to verify email ${loginLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });

    return res.status(200).json({ message: 'Email verification link sent to your email' });
};


exports.updateUser = (req, res, next) => {
    const userId = req.user.userId;
    User.findById(userId)
    .then(singleUser => {
         if (!singleUser){
            const error = new Error('Could not find user.')
            error.statusCode = 404;
            throw error;
         }
         singleUser.contractAddress = req.body.contractAddress
         
         return singleUser.save()
         .then((newUser) => {
            return res.status(200).json({
                singleUser : newUser
             })
         });
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.deleteUser = (req, res, next) => {
    const post = req.params.postId;
    User.findById(post)
    .then(singleUser => {
        if (!singleUser){
            const error = new Error('No post with that id')
            error.statusCode = 404;
            throw error;
        }

        return User.findByIdAndRemove(post);
    })
    .then(result => {
        return res.status(200).json({message: 'Deleted post successfully'});
    })
    .catch(error => {
        if (!error.statusCode){
            error.statusCode = 500;
        }
    })
}


// exports.getUser = async (req, res, next) => {
//     try {
//       const userId = req.user?.userId;
     
  
//       const user = await User.findById(userId).select("name email industry address isEmailVerified contractAddress isFirstTimeLogin idNumber")
  
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
    
//       res.status(200).json({
//         message: 'User found',
//         user,
        
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
// };
  
    
