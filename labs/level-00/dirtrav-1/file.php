<?php
$uploadDir = "/var/www/html/uploads/";

if (isset($_GET['file'])) {
    $file = $_GET['file'];
    $filePath = $uploadDir . $file;
    
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        
        switch(strtolower($extension)) {
            case 'jpg':
            case 'jpeg':
                header('Content-Type: image/jpeg');
                break;
            case 'png':
                header('Content-Type: image/png');
                break;
            case 'gif':
                header('Content-Type: image/gif');
                break;
            case 'svg':
                header('Content-Type: image/svg+xml');
                break;
            default:
                header('Content-Type: text/plain');
                break;
        }
        
        echo $content;
    } else {
        http_response_code(404);
        echo "File not found";
    }
} else {
    http_response_code(400);
    echo "No file parameter specified";
}
?>