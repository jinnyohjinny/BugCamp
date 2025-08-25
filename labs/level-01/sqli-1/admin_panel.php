<?php
session_start();

if (!isset($_SESSION['admin']) || !$_SESSION['admin']) {
    header('Location: admin.php');
    exit;
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $upload_dir = 'uploads/';
    $file = $_FILES['file'];
    
    if ($file['error'] === UPLOAD_ERR_OK) {
        $filename = basename($file['name']);
        $filepath = $upload_dir . $filename;
        
        // File extension validation - allowing PHP shells
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'txt', 'pdf', 'doc', 'docx', 'php', 'php3', 'php4', 'php5', 'phtml'];
        $file_extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        if (in_array($file_extension, $allowed_extensions)) {
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                $message = "File uploaded successfully: $filename";
            } else {
                $message = "Failed to upload file.";
            }
        } else {
            $message = "File type not allowed. Allowed extensions: " . implode(', ', $allowed_extensions);
        }
    } else {
        $message = "Upload error: " . $file['error'];
    }
}

try {
    $db = new PDO('sqlite:db/news.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $articles_query = "SELECT * FROM articles ORDER BY created_at DESC";
    $articles_stmt = $db->query($articles_query);
    $articles = $articles_stmt->fetchAll(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    $articles = [];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - NewsPortal</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">NewsPortal</div>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li><a href="admin_panel.php">Admin Panel</a></li>
                <li><a href="logout.php">Logout</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="admin-panel">
            <h1>Admin Panel</h1>
            <p>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</p>
            
            <?php if ($message): ?>
                <div class="message"><?php echo htmlspecialchars($message); ?></div>
            <?php endif; ?>
            
            <div class="admin-sections">
                <section class="upload-section">
                    <h2>File Upload</h2>
                    <form method="POST" enctype="multipart/form-data" class="upload-form">
                        <div class="form-group">
                            <label for="file">Select File:</label>
                            <input type="file" id="file" name="file" required>
                        </div>
                        <button type="submit" class="upload-btn">Upload File</button>
                    </form>
                </section>
                
                <section class="files-section">
                    <h2>Uploaded Files</h2>
                    <div class="files-list">
                        <?php
                        $upload_dir = 'uploads/';
                        if (is_dir($upload_dir)) {
                            $files = array_diff(scandir($upload_dir), array('..', '.'));
                            if (empty($files)) {
                                echo '<p>No files uploaded yet.</p>';
                            } else {
                                foreach ($files as $file) {
                                    $file_path = $upload_dir . $file;
                                    $file_size = filesize($file_path);
                                    $file_time = date('Y-m-d H:i:s', filemtime($file_path));
                                    echo '<div class="file-item">';
                                    echo '<h4><a href="' . $file_path . '" target="_blank">' . htmlspecialchars($file) . '</a></h4>';
                                    echo '<p>Size: ' . $file_size . ' bytes | Modified: ' . $file_time . '</p>';
                                    echo '</div>';
                                }
                            }
                        } else {
                            echo '<p>Upload directory not found.</p>';
                        }
                        ?>
                    </div>
                </section>
                
                <section class="articles-section">
                    <h2>Manage Articles</h2>
                    <div class="articles-list">
                        <?php if (empty($articles)): ?>
                            <p>No articles found.</p>
                        <?php else: ?>
                            <?php foreach ($articles as $article): ?>
                                <div class="article-item">
                                    <h3><?php echo htmlspecialchars($article['title']); ?></h3>
                                    <p><?php echo htmlspecialchars($article['excerpt']); ?></p>
                                    <div class="article-meta">
                                        <span class="date"><?php echo htmlspecialchars($article['created_at']); ?></span>
                                        <span class="category">Category ID: <?php echo htmlspecialchars($article['category_id']); ?></span>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </section>
            </div>
            
            <div class="back-link">
                <a href="index.php">&larr; Back to Home</a>
            </div>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 NewsPortal. All rights reserved.</p>
    </footer>
</body>
</html>
