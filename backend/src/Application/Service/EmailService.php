<?php

declare(strict_types=1);

namespace App\Application\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

class EmailService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly LoggerInterface $logger,
        private readonly string $fromAddress,
        private readonly string $fromName,
    ) {}

    public function sendPasswordReset(string $toEmail, string $toName, string $resetUrl): bool
    {
        $email = (new Email())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to($toEmail)
            ->subject('Réinitialisation de votre mot de passe RocketReport')
            ->html($this->buildPasswordResetHtml($toName, $resetUrl));

        return $this->send($email, 'password_reset', $toEmail);
    }

    public function sendEmailVerification(string $toEmail, string $toName, string $verifyUrl): bool
    {
        $email = (new Email())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to($toEmail)
            ->subject('Confirmez votre adresse email — RocketReport')
            ->html($this->buildEmailVerificationHtml($toName, $verifyUrl));

        return $this->send($email, 'email_verification', $toEmail);
    }

    private function send(Email $email, string $type, string $recipient): bool
    {
        try {
            $this->mailer->send($email);
            $this->logger->info('Email envoyé', ['type' => $type, 'to' => $recipient]);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Échec envoi email', [
                'type'      => $type,
                'to'        => $recipient,
                'error'     => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function buildPasswordResetHtml(string $name, string $resetUrl): string
    {
        $escapedName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $escapedUrl  = htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#6366f1;padding:32px 40px;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;">🚀 RocketReport</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Réinitialisation du mot de passe</h2>
                    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Bonjour <strong>{$escapedName}</strong>,</p>
                    <p style="margin:0 0 24px;color:#374151;line-height:1.6;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="background:#6366f1;border-radius:8px;">
                          <a href="{$escapedUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">Réinitialiser mon mot de passe</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Ce lien expire dans <strong>1 heure</strong>.</p>
                    <p style="margin:0;color:#6b7280;font-size:14px;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe reste inchangé.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">© RocketReport — Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        HTML;
    }

    private function buildEmailVerificationHtml(string $name, string $verifyUrl): string
    {
        $escapedName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $escapedUrl  = htmlspecialchars($verifyUrl, ENT_QUOTES, 'UTF-8');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#6366f1;padding:32px 40px;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;">🚀 RocketReport</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Confirmez votre adresse email</h2>
                    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Bonjour <strong>{$escapedName}</strong>,</p>
                    <p style="margin:0 0 24px;color:#374151;line-height:1.6;">Merci de vous être inscrit sur RocketReport ! Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="background:#6366f1;border-radius:8px;">
                          <a href="{$escapedUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">Activer mon compte</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0;color:#6b7280;font-size:14px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">© RocketReport — Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        HTML;
    }
}
