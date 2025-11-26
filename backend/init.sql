-- Initialize the database with a users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, age, email, phone) VALUES
    (1, 'John Doe', 25, 'john.doe@example.com', '123-456-7890'),
    (2, 'Jane Smith', 30, 'jane.smith@example.com', '098-765-4321'),
    (4, 'Bob Johnson', 35, 'bob.johnson@example.com', '555-123-4567')
ON CONFLICT (email) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        ALTER TABLE posts ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

INSERT INTO posts (id, user_id, title, created_at, updated_at) VALUES
    -- Posts by John Doe (user_id: 1)
    (1, 1, 'Getting Started with Rust', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
    (2, 1, 'Understanding Ownership', '2025-01-02 14:30:00', '2025-01-02 14:30:00'),
    (3, 1, 'Building Web APIs', '2025-01-03 09:15:00', '2025-01-03 09:15:00'),

    -- Posts by Jane Smith (user_id: 2)
    (4, 2, 'GraphQL vs REST', '2025-01-01 16:20:00', '2025-01-01 16:20:00'),
    (5, 2, 'Database Design Patterns', '2025-01-02 11:45:00', '2025-01-02 11:45:00'),
    (6, 2, 'Frontend State Management', '2025-01-04 13:10:00', '2025-01-04 13:10:00'),

    -- Posts by Bob Johnson (user_id: 4)
    (7, 4, 'Docker Containerization', '2025-01-01 08:30:00', '2025-01-01 08:30:00'),
    (8, 4, 'Kubernetes Deployment', '2025-01-03 15:45:00', '2025-01-03 15:45:00'),
    (9, 4, 'CI/CD Best Practices', '2025-01-05 10:20:00', '2025-01-05 10:20:00'),
    (10, 4, 'Monitoring and Observability', '2025-01-06 12:00:00', '2025-01-06 12:00:00')
    ON CONFLICT (id) DO NOTHING;

-- Add content field to posts table
ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS content TEXT DEFAULT 'Legacy post, content not available' NOT NULL;

-- Add posts with content
INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES
    (11, 1, 'Modern Test Automation', 'Content 1', '2025-01-03 09:15:00', '2025-01-03 09:15:00'),
    (12, 2, 'RustRover and Me', 'In the ever-evolving world of software development, building reliable and high-performance applications has become more important than ever. Developers are constantly searching for programming languages and frameworks that provide both speed and safety, while also allowing for expressive and maintainable code. Among the many options available today, Rust has emerged as a language that strikes a remarkable balance between performance, safety, and concurrency. Rust is unique in its approach to memory management. Unlike many languages that rely on garbage collection to handle memory allocation, Rust uses a system of ownership, borrowing, and lifetimes. This system enforces strict rules at compile time, ensuring that programs are free from common memory errors such as null pointer dereferences, use-after-free bugs, and data races. As a result, developers can write high-performance applications without sacrificing safety, which is particularly valuable in systems programming, web services, and concurrent applications. One of the most powerful features of Rust is its ownership model. Each piece of data in Rust has a single owner, and ownership can be transferred or borrowed under controlled circumstances. Borrowing allows multiple parts of a program to access data without taking ownership, while lifetimes ensure that references to data are always valid. This combination of ownership and lifetimes allows Rust to enforce memory safety without a runtime performance penalty. Developers who are new to Rust often find this model challenging at first, but once mastered, it leads to highly reliable and maintainable code. Another key aspect of Rust is its approach to concurrency. Traditional multithreaded programming can be fraught with hazards such as race conditions and deadlocks. Rust addresses these issues at the type system level. The compiler prevents data races by ensuring that only one mutable reference or multiple immutable references exist at any given time. This enables developers to write concurrent code with confidence, knowing that the compiler will catch unsafe patterns before the program ever runs. Combined with Rust’s async/await model for asynchronous programming, developers can build highly responsive applications capable of handling many tasks concurrently without risking instability or crashes. Rust is also gaining traction in the web development space. Frameworks like Actix and Axum allow developers to build fast and scalable web servers, while libraries such as SQLx provide safe and ergonomic database access. Rust’s strong type system, combined with compile-time checks, minimizes runtime errors and improves developer productivity. For example, when building a REST or GraphQL API, Rust ensures that the data types in your code match those in your database and API schema, reducing the likelihood of subtle bugs that could affect production. Beyond technical features, Rust has fostered a vibrant and supportive community. The Rust community emphasizes inclusivity, collaboration, and high-quality documentation. Resources such as “The Rust Programming Language” book, the Rustonomicon, and numerous online tutorials make it easier for new developers to get started. The community also contributes to a rich ecosystem of libraries (crates) that cover everything from web frameworks and database access to cryptography and machine learning, making it easier to build complex applications without reinventing the wheel. In conclusion, Rust is more than just a programming language; it is a tool for building reliable, fast, and safe software. Its innovative memory model, strict compile-time checks, and focus on concurrency provide developers with the confidence to create applications that are both performant and free of common programming errors. Whether you are developing system-level software, web applications, or distributed systems, learning Rust equips you with a modern toolkit that emphasizes both correctness and efficiency. As the industry continues to demand software that can handle increasing complexity without sacrificing safety, Rust is poised to become a cornerstone technology for developers around the world.', '2025-01-01 16:20:00', '2025-01-01 16:20:00'),
    (13, 4, 'Cloud Agnosticism', 'Cloud service agnosticism is the practice of building systems that are not locked into a single cloud provider. By using open standards, containerization, and portable architectures, teams can freely move workloads across AWS, Azure, Google Cloud, or on-prem environments. This flexibility reduces vendor lock-in, improves resilience, and allows organizations to choose the best services for cost, performance, and long-term strategy.', '2025-01-01 08:30:00', '2025-01-01 08:30:00')
ON CONFLICT (id) DO NOTHING;