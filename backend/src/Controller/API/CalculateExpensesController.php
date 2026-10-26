<?php

namespace App\Controller\API;

use App\Async\Stopwatch;
use App\Entity\User;
use App\Fairly\CalculateCompensation;
use App\Instrumentation\InstrumentationHolder;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api.')]
class CalculateExpensesController extends AbstractController
{
    public function __construct(
        private readonly CalculateCompensation $calculator,
        private readonly UserRepository $userRepository,
    ) {
    }

    #[Route('/calculate', name: 'calculate', methods: ['GET'])]
    public function calculate(Request $request): JsonResponse
    {
        $stopwatch = Stopwatch::start();

        $currentUser = $this->getUser();
        if (!$currentUser instanceof User) {
            return $this->json([
                'error' => 'Please login first!',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if specific user requested
        $withUserEmail = $request->query->get('with_user');

        $withUser = null;

        if ($withUserEmail) {
            // Find the specific user to calculate with
            $withUser = $this->userRepository->findOneBy(['email' => $withUserEmail]);
            if (!$withUser instanceof User) {
                return $this->json([
                    'error' => sprintf('User %s not found!', $withUserEmail),
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        assert($withUser instanceof User);

        $result = $this->calculator->calculate(
            (string) $currentUser->getUuid(),
            (string) $withUser->getUuid()
        );

        InstrumentationHolder::getMetrics()
            ->record('calculate_compensation', $stopwatch->getMillisecondsElapsed(), 'ms');

        InstrumentationHolder::getLogging()
            ->info($result['compensation']);

        $json = json_encode($result);
        assert(is_string($json));

        return $this->json([...$result, 'id' => hash('sha256', $json)]);
    }
}
