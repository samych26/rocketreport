<?php

namespace App\Domain\Entity;

use App\Domain\ValueObject\UserId;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Role;

final class User
{
    private UserId $id;
    private Email $email;
    private string $passwordHash;
    private string $firstname;
    private string $lastname;
    private Role $role;
    private bool $isActive;
    private ?string $resetToken = null;
    private ?\DateTimeImmutable $resetTokenExpiresAt = null;

    public function __construct(
        UserId $id,
        Email $email,
        string $passwordHash,
        string $firstname,
        string $lastname,
        Role $role,
        bool $isActive = true,
        ?string $resetToken = null,
        ?\DateTimeImmutable $resetTokenExpiresAt = null
    ) {
        $this->id = $id;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->firstname = $firstname;
        $this->lastname = $lastname;
        $this->role = $role;
        $this->isActive = $isActive;
        $this->resetToken = $resetToken;
        $this->resetTokenExpiresAt = $resetTokenExpiresAt;
    }


    public function firstname(): string
    {
        return $this->firstname;
    }

    public function lastname(): string
    {
        return $this->lastname;
    }

    public function id(): UserId
    {
        return $this->id;
    }

    public function email(): Email
    {
        return $this->email;
    }

    public function passwordHash(): string
    {
        return $this->passwordHash;
    }

    public function role(): Role
    {
        return $this->role;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function resetToken(): ?string
    {
        return $this->resetToken;
    }

    public function resetTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->resetTokenExpiresAt;
    }

    public function generateResetToken(): string
    {
        $this->resetToken = bin2hex(random_bytes(32));
        $this->resetTokenExpiresAt = (new \DateTimeImmutable())->modify('+1 hour');
        return $this->resetToken;
    }

    public function clearResetToken(): void
    {
        $this->resetToken = null;
        $this->resetTokenExpiresAt = null;
    }

    public function updatePassword(string $newPasswordHash): void
    {
        $this->passwordHash = $newPasswordHash;
    }

    public function deactivate(): void
    {
        $this->isActive = false;
    }
}
