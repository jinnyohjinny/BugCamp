<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Portal</title>
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
        <section class="hero">
            <h1>Welcome to NewsPortal</h1>
            <p>Stay informed with the latest news and updates</p>
        </section>
        
        <section class="featured-news">
            <h2>Featured Articles</h2>
            <div class="news-grid">
                <article class="news-card">
                    <h3>Technology Advances</h3>
                    <p>Latest developments in the tech industry and their impact on society.</p>
                    <a href="article.php?id=1" class="read-more">Read More</a>
                </article>
                <article class="news-card">
                    <h3>Global Events</h3>
                    <p>Important events happening around the world and their significance.</p>
                    <a href="article.php?id=2" class="read-more">Read More</a>
                </article>
                <article class="news-card">
                    <h3>Science Discoveries</h3>
                    <p>Recent scientific breakthroughs and their implications for the future.</p>
                    <a href="article.php?id=3" class="read-more">Read More</a>
                </article>
            </div>
        </section>
        
        <section class="categories">
            <h2>Browse by Category</h2>
            <div class="category-links">
                <a href="category.php?id=1" class="category-link">Technology</a>
                <a href="category.php?id=2" class="category-link">World News</a>
                <a href="category.php?id=3" class="category-link">Science</a>
                <a href="category.php?id=4" class="category-link">Business</a>
            </div>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 NewsPortal. All rights reserved.</p>
    </footer>
</body>
</html>
