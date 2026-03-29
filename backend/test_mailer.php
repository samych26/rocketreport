<?php

use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;

require __DIR__.'/vendor/autoload.php';

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

$dsn = $_ENV['MAILER_DSN'] ?? '';
$from = $_ENV['MAILER_FROM_ADDRESS'] ?? 'no-reply@rocketreport.me';

if (!$dsn) {
    echo "MAILER_DSN not found in .env
";
    exit(1);
}

echo "Testing with DSN: $dsn
";

$transport = Transport::fromDsn($dsn);
$mailer = new Mailer($transport);

$email = (new Email())
    ->from($from)
    ->to('samy@gmail.com') // The user's email from TEST_DATA.md
    ->subject('Test Mailer RocketReport')
    ->text('Ceci est un test de la configuration du mailer.')
    ->html('<h1>Test RocketReport</h1><p>Ceci est un test de la configuration du mailer.</p>');

try {
    $mailer->send($email);
    echo "Email sent successfully!
";
} catch (\Exception $e) {
    echo "Failed to send email: " . $e->getMessage() . "
";
    echo "Class: " . get_class($e) . "
";
}
