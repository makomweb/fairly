<?php

declare(strict_types=1);

namespace App\Fairly;

interface DenormalizerInterface
{
    /**
     * Create an object of the specified type from the specified set of normalized data.
     */
    public function fromArray(mixed $data, string $type): mixed;
}
