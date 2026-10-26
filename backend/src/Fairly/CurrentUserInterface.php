<?php

declare(strict_types=1);

namespace App\Fairly;

interface CurrentUserInterface
{
    public function getUuid(): string;

    public function getEmail(): string;
}
