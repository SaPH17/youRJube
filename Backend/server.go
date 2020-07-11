package main

import (
	"log"
	"net/http"
	"os"
	"youRJube/graph"
	"youRJube/graph/generated"
	"youRJube/postgres"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-pg/pg/v10"
	"github.com/go-chi/chi"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func main() {

	router := chi.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200", "http://localhost:8080"},
		AllowCredentials: true,
		Debug:            true,
	}).Handler)

	// pgDB := postgres.New(&pg.Options{
	// 	Addr:     "ec2-18-214-119-135.compute-1.amazonaws.com:5432",
	// 	User:     "qnhpjhiowjeffg",
	// 	Password: "0fff8683a839d232acd76490c71c3dbd07b851eec1f810ea258af957336b322f",
	// 	Database: "del57hi1sgal5",
	// })

	opt, err := pg.ParseURL("postgres://qnhpjhiowjeffg:0fff8683a839d232acd76490c71c3dbd07b851eec1f810ea258af957336b322f@ec2-18-214-119-135.compute-1.amazonaws.com:5432/del57hi1sgal5")
	if err != nil {
		panic(err)
	}

	pgDB := pg.Connect(opt)

	pgDB.AddQueryHook(postgres.DBLogger{})

	defer pgDB.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{DB: pgDB}}))

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
