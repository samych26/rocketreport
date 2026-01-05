<?php
$start = microtime(true);

echo "Loop test: ";
$s = microtime(true);
for($i=0; $i<1000000; $i++) { $a = $i * 2; }
echo (microtime(true) - $s) . "s\n";

echo "DB Test (using PDO): ";
$s = microtime(true);
try {
    $pdo = new PDO('mysql:host=db;dbname=rocketreport', 'rocket', 'secret');
    echo (microtime(true) - $s) . "s\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "Total script time: " . (microtime(true) - $start) . "s\n";
