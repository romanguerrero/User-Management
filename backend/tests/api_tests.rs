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

#[tokio::test]
async fn test_users_query_filter_by_name_contains() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering by name containing "John"
    // Should match: John Doe, Bob Johnson
    let query = r#"
        query {
            users (filters: { name: { contains: "John" } }) {
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

    // Should return exactly 2 users with "John" in their name
    assert_eq!(users.len(), 2, "Should return exactly 2 users with 'John' in their name");

    // Validate all returned users have "John" in their name
    for user in users {
        if let Value::Object(user_obj) = user {
            if let Some(Value::String(name)) = user_obj.get("name") {
                assert!(
                    name.contains("John"),
                    "User name '{}' should contain 'John'",
                    name
                );
            } else {
                panic!("User should have a 'name' field with a string value");
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

    assert!(user_names.contains(&"John Doe".to_string()), "Should include John Doe");
    assert!(user_names.contains(&"Bob Johnson".to_string()), "Should include Bob Johnson");
}

#[tokio::test]
async fn test_users_query_filter_by_email_contains() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering by email containing "example.com"
    let query = r#"
        query {
            users (filters: { email: { contains: "example.com" } }) {
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

    // Should return all 7 users since all emails contain "example.com"
    assert_eq!(users.len(), 7, "Should return 7 users with 'example.com' in their email");

    // Validate all returned users have "example.com" in their email
    for user in users {
        if let Value::Object(user_obj) = user {
            if let Some(Value::String(email)) = user_obj.get("email") {
                assert!(
                    email.contains("example.com"),
                    "User email '{}' should contain 'example.com'",
                    email
                );
            } else {
                panic!("User should have an 'email' field with a string value");
            }

            // Validate has all required fields
            assert_user_has_required_fields(user);
        } else {
            panic!("User should be an object");
        }
    }
}

#[tokio::test]
async fn test_users_query_filter_by_phone_contains() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering by phone containing "555"
    // Should match: Bob Johnson (555-123-4567), Angela Schmidt (555-123-4567), Jessica Rodriguez (555-123-4567)
    let query = r#"
        query {
            users (filters: { phone: { contains: "555" } }) {
                id
                name
                age
                email
                phone
            }
        }
    "#;

    let response = schema.execute(query).await;

    // Validate response has no errors
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let users = extract_users_from_response(&response.data);

    // Should return exactly 3 users with "555" in their phone number
    assert_eq!(users.len(), 3, "Should return exactly 3 users with '555' in their phone number");

    // Validate all returned users have "555" in their phone
    for user in users {
        if let Value::Object(user_obj) = user {
            if let Some(Value::String(phone)) = user_obj.get("phone") {
                assert!(
                    phone.contains("555"),
                    "User phone '{}' should contain '555'",
                    phone
                );
            } else {
                panic!("User should have a 'phone' field with a string value");
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

#[tokio::test]
async fn test_users_query_filter_multiple_combined() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering with multiple conditions: age = 35 AND phone contains "555"
    // Should match: Bob Johnson, Angela Schmidt, Jessica Rodriguez (all have age 35 and phone with 555)
    let query = r#"
        query {
            users (filters: {
                age: { equals: 35 },
                phone: { contains: "555" }
            }) {
                id
                name
                age
                email
                phone
            }
        }
    "#;

    let response = schema.execute(query).await;

    // Validate response has no errors
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let users = extract_users_from_response(&response.data);

    // Should return exactly 3 users matching both conditions
    assert_eq!(users.len(), 3, "Should return exactly 3 users matching age=35 and phone contains '555'");

    // Validate all returned users match both conditions
    for user in users {
        if let Value::Object(user_obj) = user {
            // Check age is 35
            if let Some(Value::Number(age)) = user_obj.get("age") {
                assert_eq!(
                    age.as_i64(),
                    Some(35),
                    "User should have age 35"
                );
            } else {
                panic!("User should have an 'age' field with a number value");
            }

            // Check phone contains "555"
            if let Some(Value::String(phone)) = user_obj.get("phone") {
                assert!(
                    phone.contains("555"),
                    "User phone '{}' should contain '555'",
                    phone
                );
            } else {
                panic!("User should have a 'phone' field with a string value");
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

#[tokio::test]
async fn test_users_query_filter_empty_result() {
    let pool = setup_test_db().await.expect("Failed to setup test database");
    let schema = create_test_schema(pool);

    // Test filtering with conditions that match no users
    // No user should have age 999
    let query = r#"
        query {
            users (filters: { age: { equals: 999 } }) {
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

    // Should return empty vector
    assert_eq!(users.len(), 0, "Should return 0 users when no matches are found");
}

