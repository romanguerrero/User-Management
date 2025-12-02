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
async fn test_users_query_basic() {    
    // Setup
    let pool = setup_test_db().await.expect("Failed to setup test database");
    
    let schema = Schema::build(Query, EmptyMutation, EmptySubscription)
        .data(pool.clone())
        .finish();

    // Execute query with empty filters
    let query = r#"
        query {
            users(filters: {}) {
                id
                name
                email
            }
        }
    "#;

    let response = schema.execute(query).await;

    // Assert
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);
    
    // Verify the response structure
    let data = &response.data;
    
    // Verify users field exists (even if empty array)
    if let Value::Object(obj) = data {
        assert!(obj.contains_key("users"), "Response should contain 'users' field");
    } else {
        panic!("Response data should be an object");
    }
}

// #[tokio::test]
// async fn test_posts_query_basic() {
//     // Setup
//     let pool = setup_test_db().await;
//     let schema = Schema::build(Query::default(), EmptyMutation, EmptySubscription)
//         .data(pool.clone())
//         .finish();

//     // Execute query with empty filters
//     let query = r#"
//         query {
//             posts(filters: {}) {
//                 id
//                 title
//                 content
//             }
//         }
//     "#;

//     let response = schema.execute(query).await;

//     // Assert
//     assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);
    
//     // Verify the response structure
//     let data = &response.data;
    
//     // Verify posts field exists (even if empty array)
//     if let Value::Object(obj) = data {
//         assert!(obj.contains_key("posts"), "Response should contain 'posts' field");
//     } else {
//         panic!("Response data should be an object");
//     }
// }
