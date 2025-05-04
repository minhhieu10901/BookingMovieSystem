import express from 'express';
import { addMovie, deleteMovie, getAllMovies, getMovieById, updateMovie } from '../controllers/movie-controller.js';

const movieRouter = express.Router();

movieRouter.get("/", getAllMovies); // add movie
movieRouter.get("/:id", getMovieById); // get movie by id
movieRouter.post("/", addMovie); // add movie
movieRouter.delete("/:id", deleteMovie); // delete movie
movieRouter.post("/:id", updateMovie); // update movie by id
export default movieRouter;