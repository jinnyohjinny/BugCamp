<?php
if(isset($_GET['hacker'])) {
    $input = $_GET['hacker'];
    $result = eval("return \"$input\";");
    echo "<div class='result'>Result: " . htmlspecialchars($result, ENT_QUOTES, 'UTF-8') . "</div>";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Code Processor</title>
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
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 500px;
            width: 90%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 1.5rem;
            text-align: center;
            font-weight: 300;
            letter-spacing: -0.5px;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #555;
        }
        
        input[type="text"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #fff;
        }
        
        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .result {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
        }
        
        .description {
            text-align: center;
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Advanced Code Processor</h1>
        <p class="description">Professional text processing system for development environments</p>
        
        <form method="GET">
            <div class="form-group">
                <label for="hacker">Input Expression:</label>
                <input type="text" id="hacker" name="hacker" placeholder="Enter text to process..." 
                       value="<?php echo isset($_GET['hacker']) ? htmlspecialchars($_GET['hacker'], ENT_QUOTES, 'UTF-8') : ''; ?>">
            </div>
            <button type="submit">Process</button>
        </form>
    </div>
</body>
</html>