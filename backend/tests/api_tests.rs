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

fn create_test_schema(pool: PgPool) -> Schema<Query, EmptyMutation, EmptySubscription> {
    Schema::build(Query, EmptyMutation, EmptySubscription)
        .data(pool)
        .finish()
}

fn assert_user_has_required_fields(user: &Value) {
    let required_fields = ["id", "name", "age", "email"];

    if let Value::Object(user_obj) = user {
        for field in required_fields {
            assert!(
                user_obj.contains_key(field),
                "User should have '{}' field",
                field
            );
        }
    } else {
        panic!("User should be an object");
    }
}

fn extract_users_from_response(response: &Value) -> &Vec<Value> {
    match response {
        Value::Object(obj) => {
            assert!(obj.contains_key("users"), "Response should contain 'users' field");

            match obj.get("users") {
                Some(Value::List(users)) => users,
                _ => panic!("users field should be a list"),
            }
        }
        _ => panic!("Response data should be an object"),
    }
}

#[tokio::test]
async fn test_users_query_with_empty_filters() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

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

    // Validate response
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let users = extract_users_from_response(&response.data);
    assert_eq!(users.len(), 7, "Should return 7 users");

    // Validate first user has required fields
    if let Some(first_user) = users.first() {
        assert_user_has_required_fields(first_user);
    }
}

#[tokio::test]
async fn test_users_query_filter_by_id_equals() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering by exact ID match (user ID: 2 - Jane Smith)
    let query = r#"
        query {
            users (filters: { id: { equals: 2 } }) {
                id
                name
                age
                email
                phone
                createdAt
                updatedAt
            }
        }
    "#;

    let response = schema.execute(query).await;

    // Validate response has no errors
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let users = extract_users_from_response(&response.data);

    // Should return exactly 1 user
    assert_eq!(users.len(), 1, "Should return exactly 1 user with ID 2");

    // Validate the returned user
    if let Some(Value::Object(user)) = users.first() {
        // Check ID is exactly 2
        if let Some(Value::Number(id)) = user.get("id") {
            assert_eq!(
                id.as_i64(),
                Some(2),
                "User ID should be 2"
            );
        } else {
            panic!("User should have an 'id' field with a number value");
        }

        // Check name is Jane Smith
        if let Some(Value::String(name)) = user.get("name") {
            assert_eq!(
                name.as_str(),
                "Jane Smith",
                "User name should be 'Jane Smith'"
            );
        } else {
            panic!("User should have a 'name' field with a string value");
        }

        // Check email
        if let Some(Value::String(email)) = user.get("email") {
            assert_eq!(
                email.as_str(),
                "jane.smith@example.com",
                "User email should match"
            );
        } else {
            panic!("User should have an 'email' field with a string value");
        }

        // Validate has all required fields
        assert_user_has_required_fields(&Value::Object(user.clone()));
    } else {
        panic!("First user should be an object");
    }
}

#[tokio::test]
async fn test_users_query_filter_by_age_equals() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering by exact age match (age: 35)
    // According to init.sql, users with age 35 are: Bob Johnson (id: 4), Angela Schmidt (id: 16), Jessica Rodriguez (id: 17)
    let query = r#"
        query {
            users (filters: { age: { equals: 35 } }) {
                id
                name
                age
                email
            }
        }
    "#;

    let response = schema.execute(query).await;

    // Validate response has no errors
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let users = extract_users_from_response(&response.data);

    // Should return exactly 3 users with age 35
    assert_eq!(users.len(), 3, "Should return exactly 3 users with age 35");

    // Validate all returned users have age 35
    for user in users {
        if let Value::Object(user_obj) = user {
            if let Some(Value::Number(age)) = user_obj.get("age") {
                assert_eq!(
                    age.as_i64(),
                    Some(35),
                    "All returned users should have age 35"
                );
            } else {
                panic!("User should have an 'age' field with a number value");
            }

            // Validate has all required fields
            assert_user_has_required_fields(user);
        } else {
            panic!("User should be an object");
        }
    }

    // Verify specific users are included
    let user_names: Vec<String> = users.iter()
        .filter_map(|u| {
            if let Value::Object(obj) = u {
                if let Some(Value::String(name)) = obj.get("name") {
                    return Some(name.to_string());
                }
            }
            None
        })
        .collect();

    assert!(user_names.contains(&"Bob Johnson".to_string()), "Should include Bob Johnson");
    assert!(user_names.contains(&"Angela Schmidt".to_string()), "Should include Angela Schmidt");
    assert!(user_names.contains(&"Jessica Rodriguez".to_string()), "Should include Jessica Rodriguez");
}

