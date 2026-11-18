<?php

declare(strict_types=1);

namespace App\Fairly;

final readonly class Calculator
{
    public function __construct(
        private EventStoreInterface $eventStore,
        private DenormalizerInterface $denormalizer,
        private EmailProviderInterface $emailProvider,
    ) {
    }

    /**
     * @return Expenses[]
     */
    public function calculate(): array
    {
        $uuids = $this->eventStore->getUserIds();

        $events = $this->eventStore->getEvents(
            new QueryOptions(
                createdBy: $uuids,
                subjectTypes: ['Expense'],
                eventTypes: ['tracked']
            )
        );

        return array_reduce(
            $events,
            $this->reduce(...),
            array_map(
                function (string $uuid): Expenses {
                    $email = $this->emailProvider->getEmailFor($uuid);

                    return Expenses::initial($uuid, $email);
                },
                $uuids
            )
        );
    }

    /**
     * @param Expenses[] $expenses
     *
     * @return Expenses[]
     */
    private function reduce(array $expenses, Event $event): array
    {
        /** @var Expenses $found */
        $found = array_find(
            $expenses,
            static fn (Expenses $expense): bool => $expense->userUuid === $event->createdBy
        );

        /** @var Expense $expense */
        $expense = $this->denormalizer->fromArray(
            $event->payload,
            Expense::class
        );

        $found->add($expense);

        return $expenses;
    }
}
