<?php

declare(strict_types=1);

namespace App\SplitFairly;

final readonly class CalculateCompensation
{
    public function __construct(
        private EventStoreInterface $eventStore,
        private DenormalizerInterface $denormalizer,
        private EmailProviderInterface $emailProvider,
    ) {
    }

    public function calculate(string $user, string $with): Compensation
    {
        return Compensation::calculate(
            $this->getExpenses($user),
            $this->getExpenses($with)
        );
    }

    private function getExpenses(string $user): Expenses
    {
        $events = $this->eventStore->getEvents(
            new QueryOptions(
                createdBy: [$user],
                subjectTypes: ['Expense'],
                eventTypes: ['tracked']
            )
        );

        $email = $this->emailProvider->getEmailFor($user);

        return array_reduce($events, $this->reduce(...), Expenses::initial($user, $email));
    }

    private function reduce(Expenses $expenses, Event $event): Expenses
    {
        $expense = $this->denormalizer->fromArray(
            $event->payload,
            Expense::class
        );

        assert($expense instanceof Expense);

        $expenses->add($expense);

        return $expenses;
    }
}