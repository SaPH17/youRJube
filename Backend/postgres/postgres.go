package postgres

import "github.com/go-pg/pg/v10"
import "fmt"
import "context"

type DBLogger struct{}

func (db DBLogger) BeforeQuery(ctx context.Context, q *pg.QueryEvent) (context.Context, error){
	return ctx, nil
}

func (db DBLogger) AfterQuery(ctx context.Context, q *pg.QueryEvent) error{
	query, err := q.FormattedQuery()
	fmt.Println(string(query))

	return err
}

func New(opts *pg.Options) *pg.DB{
	return pg.Connect(opts)
}