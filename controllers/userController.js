const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/AppError.js');
const sharp = require('sharp');
const cloudinary = require('../utils/cloudinary.js');

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

const getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError(404, 'No user found with that ID'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

const createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new AppError(404, 'No user found with that ID'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError(404, 'No user found with that ID'));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

const resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    const buffer = await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

    //upload the buffer directly to Cloudinary
    await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'natours/users',
                public_id: `user-${req.user.id}-${Date.now()}`
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    req.file.filename = result.secure_url;
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });

    next();

});

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resizeUserPhoto
};