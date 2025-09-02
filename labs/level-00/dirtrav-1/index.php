<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Corporate Asset Gallery</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            max-width: 800px;
            width: 90%;
        }

        .header {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 300;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .gallery {
            padding: 2rem;
            text-align: center;
        }

        .gallery h2 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            font-size: 1.8rem;
            font-weight: 400;
        }

        .image-container {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 2rem;
            margin: 1.5rem 0;
            border: 2px dashed #dee2e6;
        }

        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .image-info {
            margin-top: 1rem;
            color: #6c757d;
            font-style: italic;
        }

        .footer {
            background: #f8f9fa;
            padding: 1.5rem;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }

        .nav-links {
            padding: 1rem 2rem;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }

        .nav-links a {
            color: #495057;
            text-decoration: none;
            margin-right: 2rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Corporate Asset Gallery</h1>
            <p>Professional media management and display platform</p>
        </div>
        
        <div class="nav-links">
            <a href="index.php">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
        </div>

        <div class="gallery">
            <h2>Featured Assets</h2>
            
            <div class="image-container">
                <img src="file.php?file=logo.png" alt="Corporate Logo" />
                <div class="image-info">Corporate branding asset - logo.png</div>
            </div>

            <div class="image-container">
                <img src="file.php?file=banner.jpg" alt="Marketing Banner" />
                <div class="image-info">Marketing material - banner.jpg</div>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2023 Corporate Asset Gallery. All rights reserved.</p>
            <p>Professional asset management solutions for enterprise environments</p>
        </div>
    </div>
</body>
</html>