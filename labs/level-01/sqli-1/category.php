<?php
require_once 'db_connect.php';

$id = isset($_GET['id']) ? $_GET['id'] : '1';

try {
    $db = new PDO('sqlite:db/news.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $query = "SELECT id, name, description FROM categories WHERE id = $id";
    $stmt = $db->query($query);
    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        $category = ['id' => '', 'name' => 'Category Not Found', 'description' => 'The requested category could not be found.'];
    }
    
} catch (PDOException $e) {
    $category = ['id' => '', 'name' => 'Category Not Found', 'description' => 'The requested category could not be found.'];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($category['name']); ?> - NewsPortal</title>
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
        <section class="category-header">
            <h1><?php echo htmlspecialchars($category['name']); ?></h1>
            <p><?php echo htmlspecialchars($category['description']); ?></p>
        </section>
        
        <section class="category-articles">
            <h2>Articles in this Category</h2>
            <div class="articles-list">
                <?php
                try {
                    $articles_query = "SELECT id, title, excerpt, created_at FROM articles WHERE category_id = $id ORDER BY created_at DESC";
                    $articles_stmt = $db->query($articles_query);
                    $articles = $articles_stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    if (empty($articles)) {
                        echo '<p class="no-articles">No articles found in this category.</p>';
                    } else {
                        foreach ($articles as $article) {
                            echo '<article class="article-item">';
                            echo '<h3>' . htmlspecialchars($article['title']) . '</h3>';
                            echo '<p>' . htmlspecialchars($article['excerpt']) . '</p>';
                            echo '<div class="article-meta">';
                            echo '<span class="date">' . htmlspecialchars($article['created_at']) . '</span>';
                            echo '<a href="article.php?id=' . $article['id'] . '" class="read-more">Read More</a>';
                            echo '</div>';
                            echo '</article>';
                        }
                    }
                } catch (PDOException $e) {
                    echo '<p class="no-articles">No articles found in this category.</p>';
                }
                ?>
            </div>
        </section>
        
        <div class="back-link">
            <a href="index.php">&larr; Back to Home</a>
        </div>
    </main>
    
    <footer>
        <p>&copy; 2024 NewsPortal. All rights reserved.</p>
    </footer>
</body>
</html>
