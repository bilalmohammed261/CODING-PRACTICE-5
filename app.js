const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let dbObj = null;
app.use(express.json());

const openDatabaseAndStartServer = async () => {
  try {
    dbObj = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error message is: ${e.message}`);
    process.exit(1);
  }
};

const convertSnakeToCamel1 = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

const convertSnakeToCamel2 = (obj) => {
  return {
     movieId : obj.movie_id,
     directorId :obj.director_id,
    movieName: obj.movie_name,
    leadActor : obj.lead_actor,    
  };
};

const convertSnakeToCamel3 = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

openDatabaseAndStartServer();

//API1
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM
    movie;`;
  const moviesData = await dbObj.all(getAllMoviesQuery);
  response.send(moviesData.map((obj) => convertSnakeToCamel1(obj)));
});
//API2
app.post("/movies/", async (request, response) => {
  const newMovie = request.body;
  //console.log(newMovie);
  const { directorId, movieName, leadActor } = newMovie;
  const addQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}');`;
  await dbObj.run(addQuery);
  response.send("Movie Successfully Added");
});

//API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //console.log(movieId);
  const searchQuery = `SELECT *
    FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await dbObj.get(searchQuery);
  response.send(convertSnakeToCamel2(dbResponse));
  //console.log(dbResponse);
});
//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;
  //console.log(directorId);
  const updateQuery = `UPDATE movie
  SET director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id =${movieId};`;
  await dbObj.run(updateQuery);
  response.send("Movie Details Updated");
});
//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE  movie_id =${movieId};`;
  await dbObj.run(deleteQuery);
  response.send("Movie Removed");
});

//API6
app.get("/directors/", async (request, response) => {
  const directorsQuery = `SELECT * FROM director;`;
  const directors = await dbObj.all(directorsQuery);
  response.send(directors.map((obj) => convertSnakeToCamel3(obj)));
});

//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query1 = `SELECT movie_name FROM movie
   WHERE director_id = ${directorId};`;
  const query1Result = await dbObj.all(query1);
  response.send(query1Result.map((obj) => convertSnakeToCamel1(obj)));
});

module.exports = app;
