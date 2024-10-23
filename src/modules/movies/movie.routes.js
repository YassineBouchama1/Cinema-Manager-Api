const express = require('express');
const { protect, allowedTo, getUserFromToken } = require('../../middleware/auth.middleware');
const { createMovie, deleteMovie, updateMovie, viewMovie, viewMovies, uploadMedia, streamMovie } = require('./movie.controller');
const upload = require('../../middleware/upload.middleware');
const Movie = require('./movie.model');
const checkUserAccessToResource = require('../../middleware/accessControl.middleware');
const { movieByIdValidator, createMovieValidator, updateMovieValidator } = require('./movie.validator');


const router = express.Router();




router.route('/stream/:id')

    .get(streamMovie)


// @access  : Private : Admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), upload, uploadMedia, createMovieValidator, createMovie)

    .get(getUserFromToken, viewMovies);






router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(Movie), deleteMovie)
    .get(movieByIdValidator, getUserFromToken, viewMovie) //getUserFromToken is middle war help us get user info if token procider 
    .put(protect, allowedTo('admin', 'super'), updateMovieValidator, upload, uploadMedia, checkUserAccessToResource(Movie), updateMovie);






module.exports = router;


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management
 */

/**
 * @swagger
 * /movie:
 *   post:
 *     tags: [Movies]
 *     summary: Create a new movie
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               duration:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *                 enum: [action, comedy, drama, horror, romance, thriller, animation]
 *               image:
 *                 type: string
 *               video:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       500:
 *         description: Error creating movie
 */

/**
 * @swagger
 * /movie/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Get a single movie by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 genre:
 *                   type: string
 *                 image:
 *                   type: string
 *                 rating:
 *                   type: number
 *                 duration:
 *                   type: string
 *                 description:
 *                   type: string
 *                 hasStream:
 *                   type: boolean
 *                 userRating:
 *                   type: number
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Error fetching movie
 */

/**
 * @swagger
 * /movie/{id}:
 *   delete:
 *     tags: [Movies]
 *     summary: Delete a movie
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Error deleting movie
 */

/**
 * @swagger
 * /movie/{id}:
 *   put:
 *     tags: [Movies]
 *     summary: Update a movie
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               duration:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *                 enum: [action, comedy, drama, horror, romance, thriller, animation]
 *               image:
 *                 type: string
 *               video:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Error updating movie
 */

/**
 * @swagger
 * /movie:
 *   get:
 *     tags: [Movies]
 *     summary: Get all public movies
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         description: Search for a movie by name
 *         schema:
 *           type: string
 *       - name: genre
 *         in: query
 *         required: false
 *         description: Filter movies by genre
 *         schema:
 *           type: string
 *           enum: [action, comedy, drama, horror, romance, thriller, animation]
 *     responses:
 *       200:
 *         description: List of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       genre:
 *                         type: string
 *                       image:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       duration:
 *                         type: string
 *       500:
 *         description: Error fetching movies
 */

/**
 * @swagger
 * /movie/stream/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Stream movie video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Streaming video
 *       404:
 *         description: Video not found
 *       500:
 *         description: Error streaming video
 */