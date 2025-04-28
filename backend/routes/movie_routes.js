import express from 'express';
import { addMovie, getAllMovies, getMovieById } from '../controllers/movie-controller.js';
import { get } from 'mongoose';
const movieRouter = express.Router();

movieRouter.get("/", getAllMovies); // add movie
movieRouter.get("/:id", getMovieById); // get movie by id
movieRouter.post("/", addMovie); // add movie


export default movieRouter;