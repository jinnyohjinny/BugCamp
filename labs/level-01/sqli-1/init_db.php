<?php
try {
    $db = new PDO('sqlite:db/news.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create tables
    $db->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    ");
    
    $db->exec("
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            excerpt TEXT,
            content TEXT,
            category_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    ");
    
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            role TEXT DEFAULT 'user',
            api_key TEXT
        )
    ");
    
    $db->exec("
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_name TEXT UNIQUE NOT NULL,
            setting_value TEXT NOT NULL,
            description TEXT
        )
    ");
    
    // Insert sample categories
    $db->exec("INSERT OR IGNORE INTO categories (id, name, description) VALUES (1, 'Technology', 'Latest technology news and updates')");
    $db->exec("INSERT OR IGNORE INTO categories (id, name, description) VALUES (2, 'World News', 'Global events and international news')");
    $db->exec("INSERT OR IGNORE INTO categories (id, name, description) VALUES (3, 'Science', 'Scientific discoveries and research')");
    $db->exec("INSERT OR IGNORE INTO categories (id, name, description) VALUES (4, 'Business', 'Business and economic news')");
    
    // Insert sample articles with more realistic content
    $db->exec("INSERT OR IGNORE INTO articles (title, excerpt, content, category_id) VALUES (
        'AI Breakthrough in Medical Diagnosis',
        'Researchers develop new artificial intelligence system that can detect early signs of diseases with unprecedented accuracy.',
        'A team of researchers from leading universities has developed a revolutionary artificial intelligence system that can detect early signs of various diseases with unprecedented accuracy. The system, which combines deep learning algorithms with advanced medical imaging techniques, has shown remarkable results in preliminary trials.\n\nAccording to the research team, the AI system can analyze medical scans and identify patterns that human doctors might miss. This breakthrough could lead to earlier detection of serious conditions, potentially saving countless lives.\n\nThe technology is currently being tested in several major hospitals and could be available for clinical use within the next two years.',
        1
    )");
    
    $db->exec("INSERT OR IGNORE INTO articles (title, excerpt, content, category_id) VALUES (
        'Global Climate Summit Reaches Historic Agreement',
        'World leaders agree on ambitious new targets for reducing carbon emissions and combating climate change.',
        'In a historic breakthrough, world leaders at the Global Climate Summit have reached an unprecedented agreement on ambitious new targets for reducing carbon emissions. The agreement, which was reached after intense negotiations, commits participating nations to reduce their carbon emissions by 50% by 2030.\n\nThe summit, attended by representatives from over 190 countries, also established a new international fund to help developing nations transition to renewable energy sources. This marks a significant step forward in global efforts to combat climate change.\n\nEnvironmental experts have praised the agreement as a turning point in international climate policy, though they emphasize that implementation will be crucial for success.',
        2
    )");
    
    $db->exec("INSERT OR IGNORE INTO articles (title, excerpt, content, category_id) VALUES (
        'Quantum Computing Milestone Achieved',
        'Scientists successfully demonstrate quantum supremacy in solving complex computational problems.',
        'A team of physicists has achieved a major milestone in quantum computing by demonstrating quantum supremacy in solving complex computational problems that would take traditional supercomputers thousands of years to complete.\n\nThe breakthrough involved a quantum computer with 53 qubits that solved a specific mathematical problem in just 200 seconds. The same problem would take the world''s most powerful supercomputer approximately 10,000 years to solve.\n\nThis achievement represents a significant step toward practical quantum computing applications, which could revolutionize fields such as cryptography, drug discovery, and materials science.',
        3
    )");
    
    $db->exec("INSERT OR IGNORE INTO articles (title, excerpt, content, category_id) VALUES (
        'Tech Startup Revolutionizes Remote Work',
        'Innovative platform transforms how teams collaborate in distributed work environments.',
        'A Silicon Valley startup has launched a revolutionary platform that is transforming how teams collaborate in distributed work environments. The platform combines advanced project management tools with AI-powered communication features to create seamless remote work experiences.\n\nThe company, which was founded just two years ago, has already attracted over $100 million in venture capital funding and serves clients ranging from small startups to Fortune 500 companies.\n\nIndustry analysts predict that this technology could become the standard for remote work collaboration, especially as more companies adopt hybrid work models in the post-pandemic era.',
        4
    )");
    
    // Insert admin user with sensitive information
    $db->exec("INSERT OR IGNORE INTO users (username, password, email, role, api_key) VALUES ('admin', 'admin', 'admin@newsportal.com', 'administrator', 'sk-1234567890abcdef')");
    
    // Insert additional test users for union attack demonstration
    $db->exec("INSERT OR IGNORE INTO users (username, password, email, role, api_key) VALUES ('editor', 'editor123', 'editor@newsportal.com', 'editor', 'sk-abcdef1234567890')");
    $db->exec("INSERT OR IGNORE INTO users (username, password, email, role, api_key) VALUES ('user1', 'password', 'user1@example.com', 'user', 'sk-fedcba0987654321')");
    
    // Insert sensitive configuration data
    $db->exec("INSERT OR IGNORE INTO config (setting_name, setting_value, description) VALUES ('db_password', 'super_secret_db_pass', 'Database password for production')");
    $db->exec("INSERT OR IGNORE INTO config (setting_name, setting_value, description) VALUES ('jwt_secret', 'jwt_secret_key_12345', 'JWT signing secret')");
    $db->exec("INSERT OR IGNORE INTO config (setting_name, setting_value, description) VALUES ('encryption_key', 'aes256_encryption_key_67890', 'AES encryption key')");
    $db->exec("INSERT OR IGNORE INTO config (setting_name, setting_value, description) VALUES ('admin_email', 'admin@newsportal.internal', 'Administrator email address')");
    $db->exec("INSERT OR IGNORE INTO config (setting_name, setting_value, description) VALUES ('backup_location', '/var/backups/newsportal/', 'Database backup location')");
    
    echo "Database initialized successfully!\n";
    
} catch (PDOException $e) {
    echo "Database initialization failed: " . $e->getMessage() . "\n";
}
?>
