use async_graphql::{EmptyMutation, EmptySubscription, Schema, Value};
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;

// Include the modules directly for testing
#[path = "../src/resolvers.rs"]
mod resolvers;

use resolvers::Query;

async fn setup_test_db() -> Result<PgPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:password@localhost:5432/graphql_db".to_string());
    
    println!("Initializing postgres Pool with URL: {}", database_url);
    
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await?;
    
    println!("Postgres successfully connected.");
    
    Ok(pool)
}

#[tokio::test]
async fn test_users_query_without_filters() {
    // Setup
    let pool = setup_test_db().await.expect("Failed to setup test database");

    let schema = Schema::build(Query, EmptyMutation, EmptySubscription)
        .data(pool.clone())
        .finish();

    // Execute query without filters
    let query = r#"
        query {
            users (filters: {}) {
                id
                name
                age
                email
                phone
                createdAt
                updatedAt
                posts {
                  id
                  userId
                  title
                  content
                  createdAt
                  updatedAt
                }
            }
        }
    "#;

    let response = schema.execute(query).await;

    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let data = &response.data;

    if let Value::Object(obj) = data {
        assert!(obj.contains_key("users"), "Response should contain 'users' field");

        if let Some(Value::List(users)) = obj.get("users") {
            assert_eq!(users.len(), 7, "Should return 7 users");

            if let Some(Value::Object(first_user)) = users.first() {
                assert!(first_user.contains_key("id"), "User should have 'id' field");
                assert!(first_user.contains_key("name"), "User should have 'name' field");
                assert!(first_user.contains_key("age"), "User should have 'age' field");
                assert!(first_user.contains_key("email"), "User should have 'email' field");
            } else {
                panic!("First user should be an object");
            }
        } else {
            panic!("users field should be a list");
        }
    } else {
        panic!("Response data should be an object");
    }
}
