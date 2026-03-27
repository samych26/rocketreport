<?php
$url = getenv('DATABASE_URL');
echo "Testing DATABASE_URL: " . substr($url, 0, 15) . "..." . PHP_EOL;

try {
    $parsed = parse_url($url);
    $host = $parsed['host'];
    $port = $parsed['port'] ?? 3306;
    $user = $parsed['user'];
    $pass = $parsed['pass'];
    $db   = ltrim($parsed['path'], '/');

    echo "Attempting connection to $host:$port as $user..." . PHP_EOL;

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "SUCCESS: Connected to database!" . PHP_EOL;
} catch (Exception $e) {
    echo "FAILURE: " . $e->getMessage() . PHP_EOL;
}
