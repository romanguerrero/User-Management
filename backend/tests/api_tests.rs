use async_graphql::{EmptyMutation, EmptySubscription, Schema, Value};
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;
use tokio::sync::OnceCell;

#[path = "../src/resolvers.rs"]
mod resolvers;

use resolvers::Query;

// Shared database pool for all tests
static DB_POOL: OnceCell<PgPool> = OnceCell::const_new();

// Helper functions
async fn get_test_db_pool() -> &'static PgPool {
    DB_POOL.get_or_init(|| async {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:password@localhost:5432/graphql_db".to_string());

        println!("Initializing postgres Pool with URL: {}", database_url);

        let pool = PgPoolOptions::new()
            .max_connections(10)
            .connect(&database_url)
            .await
            .expect("Failed to connect to database");

        println!("Postgres successfully connected.");

        pool
    }).await
}

fn create_test_schema(pool: &PgPool) -> Schema<Query, EmptyMutation, EmptySubscription> {
    Schema::build(Query, EmptyMutation, EmptySubscription)
        .data(pool.clone())
        .finish()
}

fn assert_user_has_required_fields(user: &Value) {
    let required_fields = ["id", "name", "age", "email"];

    let Value::Object(user_obj) = user else {
        panic!("User should be an object");
    };

    for field in required_fields {
        assert!(
            user_obj.contains_key(field),
            "User should have '{}' field",
            field
        );
    }
}

fn extract_users_from_response(response: &Value) -> &Vec<Value> {
    let Value::Object(obj) = response else {
        panic!("Response data should be an object");
    };

    let Some(Value::List(users)) = obj.get("users") else {
        panic!("Response should contain 'users' field as a list");
    };

    users
}

fn get_string_field<'a>(obj: &'a Value, field: &str) -> &'a str {
    let Value::Object(user_obj) = obj else {
        panic!("Expected object when getting field '{}'", field);
    };

    let Some(Value::String(value)) = user_obj.get(field) else {
        panic!("Expected string field '{}' not found", field);
    };

    value.as_str()
}

fn get_number_field(obj: &Value, field: &str) -> i64 {
    let Value::Object(user_obj) = obj else {
        panic!("Expected object when getting field '{}'", field);
    };

    let Some(Value::Number(value)) = user_obj.get(field) else {
        panic!("Expected number field '{}' not found", field);
    };

    value.as_i64().expect(&format!("Field '{}' should be a valid i64", field))
}

fn extract_user_names(users: &[Value]) -> Vec<String> {
    users.iter()
        .filter_map(|user| {
            let Value::Object(obj) = user else {
                return None;
            };

            let Some(Value::String(name)) = obj.get("name") else {
                return None;
            };

            Some(name.to_string())
        })
        .collect()
}

fn assert_users_contain_names(users: &[Value], expected_names: &[&str]) {
    let user_names = extract_user_names(users);
    for expected in expected_names {
        assert!(
            user_names.contains(&expected.to_string()),
            "Should include {}",
            expected
        );
    }
}

async fn execute_query_and_extract_users(schema: &Schema<Query, EmptyMutation, EmptySubscription>, query: &str) -> Vec<Value> {
    let response = schema.execute(query).await;
    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);
    extract_users_from_response(&response.data).clone()
}

// user query tests
#[tokio::test]
async fn test_users_query_with_empty_filters() {
    let pool = get_test_db_pool().await;
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

    assert!(response.errors.is_empty(), "Query returned errors: {:?}", response.errors);

    let users = extract_users_from_response(&response.data);
    assert_eq!(users.len(), 7, "Should return 7 users");

    if let Some(first_user) = users.first() {
        assert_user_has_required_fields(first_user);
    }
}

#[tokio::test]
async fn test_users_query_filter_by_id_equals() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 1, "Should return exactly 1 user with ID 2");

    let user = &users[0];
    assert_eq!(get_number_field(user, "id"), 2, "User ID should be 2");
    assert_eq!(get_string_field(user, "name"), "Jane Smith", "User name should be 'Jane Smith'");
    assert_eq!(get_string_field(user, "email"), "jane.smith@example.com", "User email should match");
    assert_user_has_required_fields(user);
}

#[tokio::test]
async fn test_users_query_filter_by_age_equals() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 3, "Should return exactly 3 users with age 35");

    for user in &users {
        assert_eq!(get_number_field(user, "age"), 35, "All returned users should have age 35");
        assert_user_has_required_fields(user);
    }

    assert_users_contain_names(&users, &["Bob Johnson", "Angela Schmidt", "Jessica Rodriguez"]);
}

#[tokio::test]
async fn test_users_query_filter_by_name_contains() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 2, "Should return exactly 2 users with 'John' in their name");

    for user in &users {
        let name = get_string_field(user, "name");
        assert!(name.contains("John"), "User name '{}' should contain 'John'", name);
        assert_user_has_required_fields(user);
    }

    assert_users_contain_names(&users, &["John Doe", "Bob Johnson"]);
}

#[tokio::test]
async fn test_users_query_filter_by_email_contains() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 7, "Should return 7 users with 'example.com' in their email");

    for user in &users {
        let email = get_string_field(user, "email");
        assert!(email.contains("example.com"), "User email '{}' should contain 'example.com'", email);
        assert_user_has_required_fields(user);
    }
}

#[tokio::test]
async fn test_users_query_filter_by_phone_contains() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 3, "Should return exactly 3 users with '555' in their phone number");

    for user in &users {
        let phone = get_string_field(user, "phone");
        assert!(phone.contains("555"), "User phone '{}' should contain '555'", phone);
        assert_user_has_required_fields(user);
    }

    assert_users_contain_names(&users, &["Bob Johnson", "Angela Schmidt", "Jessica Rodriguez"]);
}

#[tokio::test]
async fn test_users_query_filter_multiple_combined() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 3, "Should return exactly 3 users matching age=35 and phone contains '555'");

    for user in &users {
        assert_eq!(get_number_field(user, "age"), 35, "User should have age 35");
        let phone = get_string_field(user, "phone");
        assert!(phone.contains("555"), "User phone '{}' should contain '555'", phone);
        assert_user_has_required_fields(user);
    }

    assert_users_contain_names(&users, &["Bob Johnson", "Angela Schmidt", "Jessica Rodriguez"]);
}

#[tokio::test]
async fn test_users_query_filter_empty_result() {
    let pool = get_test_db_pool().await;
    let schema = create_test_schema(pool);

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

    let users = execute_query_and_extract_users(&schema, query).await;
    assert_eq!(users.len(), 0, "Should return 0 users when no matches are found");
}

