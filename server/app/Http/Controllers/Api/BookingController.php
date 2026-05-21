<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Requests\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Repositories\BookingRepository;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService $bookingService,
        protected BookingRepository $bookingRepository
    ) {}

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $data = $request->validated();

        // Use logged-in user's email if not provided
        if (empty($data['email']) && $userId) {
            $user = $request->user() ?? PersonalAccessToken::findToken($request->bearerToken() ?? '')?->tokenable;
            $data['email'] = $user?->email;
        }

        $booking = $this->bookingService->createBooking($data, $userId);

        return response()->json([
            'message' => 'Booking request created successfully!',
            'booking' => new BookingResource($booking),
            'notification' => [
                'sent' => true,
                'message' => "Booking received. Track your order with code: {$booking->tracking_code}",
            ],
        ], 201);
    }

    public function track(Request $request): JsonResponse
    {
        $request->validate(['tracking_code' => 'required|string']);

        $booking = $this->bookingRepository->findByTrackingCode($request->tracking_code);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json(['booking' => new BookingResource($booking)]);
    }

    public function myOrders(Request $request): JsonResponse
    {
        $bookings = $this->bookingRepository->forUser($request->user()->id);

        return response()->json(['bookings' => BookingResource::collection($bookings)]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);
        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }
        if (! $request->user()->isAdmin() && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(['booking' => new BookingResource($booking)]);
    }

    public function update(UpdateBookingRequest $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        if ($booking->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $updated = $this->bookingService->updateBooking($booking, $request->validated());
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Booking updated successfully.',
            'booking' => new BookingResource($updated),
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        if ($booking->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $updated = $this->bookingService->cancelBooking($booking);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Booking cancelled.',
            'booking' => new BookingResource($updated),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $bookings = $this->bookingRepository->all([
            'status' => $request->status,
            'search' => $request->search,
            'per_page' => $request->per_page ?? 15,
            'is_done' => $request->has('is_done') ? filter_var($request->is_done, FILTER_VALIDATE_BOOLEAN) : null,
        ]);

        return response()->json($bookings);
    }

    public function adminShow(int $id): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);
        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json(['booking' => new BookingResource($booking)]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, int $id): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);
        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $updated = $this->bookingService->updateStatus(
            $booking,
            $request->status,
            $request->delivery_rider
        );

        return response()->json([
            'message' => 'Status updated successfully.',
            'booking' => new BookingResource($updated),
        ]);
    }

    public function markDone(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $updated = $this->bookingService->markDone($booking, true);

        return response()->json([
            'message' => 'Booking marked as DONE.',
            'booking' => new BookingResource($updated),
        ]);
    }

    public function markNotDone(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $updated = $this->bookingService->markDone($booking, false);

        return response()->json([
            'message' => 'Booking marked as NOT DONE.',
            'booking' => new BookingResource($updated),
        ]);
    }

    public function adminCancel(int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        try {
            $updated = $this->bookingService->adminCancelBooking($booking);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Booking cancelled. Customer notified via SMS.',
            'booking' => new BookingResource($updated),
        ]);
    }

    public function trash(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        try {
            $this->bookingService->trashCancelledBooking($booking, $request->user()->id);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Booking moved to trash.']);
    }

    public function myTrash(Request $request): JsonResponse
    {
        $bookings = $this->bookingRepository->trashedForUser($request->user()->id);

        return response()->json(['bookings' => BookingResource::collection($bookings)]);
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $booking = Booking::onlyTrashed()->findOrFail($id);

        try {
            $restored = $this->bookingService->restoreBooking($booking, $request->user()->id);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Booking restored from trash.',
            'booking' => new BookingResource($restored),
        ]);
    }

    public function forceDestroy(Request $request, int $id): JsonResponse
    {
        $booking = Booking::onlyTrashed()->findOrFail($id);

        try {
            $this->bookingService->forceDeleteBooking($booking, $request->user()->id);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Booking permanently deleted.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $this->bookingService->deleteBooking($booking);

        return response()->json(['message' => 'Booking deleted.']);
    }

    public function exportPdf(int $id): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);
        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json([
            'booking' => new BookingResource($booking),
            'export_url' => url("/api/admin/bookings/{$id}/pdf"),
        ]);
    }

    /** Resolve user from optional Bearer token on public booking route */
    protected function resolveUserId(Request $request): ?int
    {
        if ($request->user()) {
            return $request->user()->id;
        }

        $token = $request->bearerToken();
        if ($token) {
            return PersonalAccessToken::findToken($token)?->tokenable_id;
        }

        return null;
    }
}
