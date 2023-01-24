const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server and Database connected successfully");
    });
  } catch (e) {
    console.log(`db error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API  1
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM movie`;
  const moviesArray = await db.all(getAllMoviesQuery);
  function convertToObject(item) {
    return {
      movieName: item.movie_name,
    };
  }
  let newArray = moviesArray.map(convertToObject);

  response.send(newArray);
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const detailsPostingQuery = `INSERT INTO 
  movie(director_id,movie_name,lead_actor)
   VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(detailsPostingQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM
     movie
    WHERE 
    movie_id=${movieId};
    `;
  const movie = await db.get(getMovieQuery);

  function giveObject(movie) {
    return {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor,
    };
  }
  movieObj = giveObject(movie);

  response.send(movieObj);
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieUpdateQuery = `UPDATE 
        movie 
     SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId};`;
  // console.log("done");
  await db.run(movieUpdateQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieRemovalQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(movieRemovalQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director`;
  const directorsArray = await db.all(getAllDirectorsQuery);
  function convertToObject(item) {
    return {
      directorId: item.director_id,
      directorName: item.director_name,
    };
  }
  let newArray = directorsArray.map(convertToObject);

  response.send(newArray);
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesByDirectorQuery = `SELECT 
   movie_name
    FROM
     movie
    WHERE 
    director_id=${directorId};`;
  const moviesByDirectorArray = await db.all(moviesByDirectorQuery);
  function convertToObject(item) {
    return {
      movieName: item.movie_name,
    };
  }
  let newArray = moviesByDirectorArray.map(convertToObject);

  response.send(newArray);
});
module.exports = app;
