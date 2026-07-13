<?php

declare(strict_types=1);

namespace App\SplitFairly;

use App\Invariant\Ensure;

final readonly class CalculateCompensation
{
    public function __construct(
        private EventStoreInterface $eventStore,
        private DenormalizerInterface $denormalizer,
        private EmailProviderInterface $emailProvider,
    ) {
    }

    /**
     * @return array{
     *  compensation: Compensation
     * }
     */
    public function calculate(string $user, string $with): array
    {
        Ensure::that($user !== $with, 'Cannot settle with yourself!');

        $expensesUser = $this->getExpenses($user);
        $expensesWith = $this->getExpenses($with);

        return [
            'users' => array_map(
                static fn (Expenses $e) => [
                    'user_email' => $e->userEmail,
                    'categories' => $e->categories(),
                ],
                [$expensesUser, $expensesWith]
            ),
            'compensation' => Compensation::calculate($expensesUser, $expensesWith),
        ];
    }

    private function getExpenses(string $userId): Expenses
    {
        $events = $this->eventStore->getEvents(
            new QueryOptions(
                createdBy: [$userId],
                subjectTypes: ['Expense'],
                eventTypes: ['tracked']
            )
        );

        $email = $this->emailProvider->getEmailFor($userId);

        return array_reduce($events, $this->reduce(...), Expenses::initial($userId, $email));
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
