<?php

declare(strict_types=1);

namespace App\Fairly;

interface EmailProviderInterface
{
    public function getEmailFor(string $userUuid): string;
}
