const expressAsyncHandler = require('express-async-handler');
const MovieService = require('./movie.service');
const ApiError = require('../../utils/ApiError');
const { createProxyMiddleware } = require('http-proxy-middleware');

// @desc    Upload media to storage 
// @route   
// @access  Private
exports.uploadMedia = expressAsyncHandler(async (req, res, next) => {
    try {
        const mediaData = await MovieService.uploadMedia(req);
        req.body.image = mediaData.image || req.body.image;
        req.body.video = mediaData.video || req.body.video;
        next();
    } catch (error) {
        return next(error);
    }
});

// @desc    Create a new movie
// @route   POST /api/v1/movie
// @access  Private
exports.createMovie = expressAsyncHandler(async (req, res, next) => {
    console.log(req.body)
    try {
        const movieData = await MovieService.createMovie(req.body);
        res.status(201).json({ data: movieData, message: 'Movie created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating Movie: ${error.message}`, 500));

    }
});

// @desc    Get a single movie by ID
// @route   GET /api/v1/movie/:id
// @access  Private - admin
exports.viewMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?._id.toString();




        const { movie, userRating } = await MovieService.viewMovie(req.params.id, userId);

        const hasStream = !!movie.video; // Check if the movie has a video stream

        const response = {
            ...movie.toObject(),
            hasStream,
            userRating, // Include the user's rating in the response
        };

        delete response.video; // Remove the video field from the response

        res.status(200).json(response);
    } catch (error) {
        return next(new ApiError(`Error fetching Movie: ${error.message}`, 500));
    }
});

// @desc    Delete a movie
// @route   DELETE /api/v1/movie/:id
// @access  Private
exports.deleteMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const result = await MovieService.deleteMovie(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error delete Movie: ${error.message}`, 500));

    }
});

// @desc    Update a movie
// @route   PUT /api/v1/movie/:id
// @access  Private
exports.updateMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (req.files.image) {
            updateData.image = req.body.image;
        }
        if (req.files.video) {
            updateData.video = req.body.video;
        }
        const movieUpdated = await MovieService.updateMovie(req.params.id, updateData);
        res.status(200).json(movieUpdated);
    } catch (error) {
        return next(new ApiError(`Error Updating Movie: ${error.message}`, 500));

    }
});

// @desc    Get all public movies streaming
// @route   GET /api/v1/movie
// @access  Public 
exports.viewMovies = expressAsyncHandler(async (req, res, next) => {
    const { search, genre } = req.query;
    const conditions = { isDeleted: false };

    const userId = req.user?._id.toString();

    // Filter by movie name if provided
    if (search) {
        conditions.name = { $regex: search, $options: 'i' };
    }

    // Filter by category if provided
    if (genre) {
        conditions.genre = genre;
    }

    try {
        const movies = await MovieService.viewMovies(conditions, userId);
        res.status(200).json({ data: movies });
    } catch (error) {
        return next(new ApiError(`Error fetch Movie: ${error.message}`, 500));

    }
});



// @desc    Stream movie video
// @route   GET /api/v1/movie/stream/:id
// @access  Private
exports.streamMovie = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Check if user is authenticated
    // if (!req.user) {
    //     return next(new ApiError('Unauthorized access', 401));
    // }

    try {
        // Ggt the video URL from the service
        const videoUrl = await MovieService.getVideoUrl(id);

        // create a proxy to the Minio server
        const proxy = createProxyMiddleware({
            target: videoUrl,
            changeOrigin: true,
            pathRewrite: (path, req) => {
                return '';
            },
            onProxyRes: (proxyRes, req, res) => {
                // Remove headers  exposethe file location
                proxyRes.headers['x-amz-request-id'] = undefined;
                proxyRes.headers['x-amz-id-2'] = undefined;
            }
        });

        // use the proxy middleware
        proxy(req, res, next);


    } catch (error) {
        return next(new ApiError(`Error fetching video: ${error.message}`, 500));
    }
});




