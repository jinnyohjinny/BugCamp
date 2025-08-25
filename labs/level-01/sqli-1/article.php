<?php
require_once 'db_connect.php';

$id = isset($_GET['id']) ? $_GET['id'] : '1';

try {
    $db = new PDO('sqlite:db/news.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $query = "SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$id]);
    $article = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$article) {
        $article = ['title' => 'Article Not Found', 'content' => 'The requested article could not be found.', 'category_name' => 'Unknown'];
    }
    
} catch (PDOException $e) {
    $article = ['title' => 'Database Error', 'content' => 'An error occurred while accessing the database.', 'category_name' => 'Error'];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($article['title']); ?> - NewsPortal</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">NewsPortal</div>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li><a href="admin.php">Admin</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article class="article-full">
            <header class="article-header">
                <h1><?php echo htmlspecialchars($article['title']); ?></h1>
                <div class="article-meta">
                    <span class="category"><?php echo htmlspecialchars($article['category_name']); ?></span>
                    <?php if (isset($article['created_at'])): ?>
                        <span class="date"><?php echo htmlspecialchars($article['created_at']); ?></span>
                    <?php endif; ?>
                </div>
            </header>
            
            <div class="article-content">
                <?php if (isset($article['excerpt'])): ?>
                    <div class="article-excerpt">
                        <p><?php echo htmlspecialchars($article['excerpt']); ?></p>
                    </div>
                <?php endif; ?>
                
                <?php if (isset($article['content'])): ?>
                    <div class="article-body">
                        <p><?php echo htmlspecialchars($article['content']); ?></p>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="article-navigation">
                <div class="back-link">
                    <a href="index.php">&larr; Back to Home</a>
                </div>
                <?php if (isset($article['category_id'])): ?>
                    <div class="category-link">
                        <a href="category.php?id=<?php echo htmlspecialchars($article['category_id']); ?>">View More in <?php echo htmlspecialchars($article['category_name']); ?></a>
                    </div>
                <?php endif; ?>
            </div>
        </article>
    </main>
    
    <footer>
        <p>&copy; 2024 NewsPortal. All rights reserved.</p>
    </footer>
</body>
</html>
