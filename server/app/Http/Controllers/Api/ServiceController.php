<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::where('is_active', true)->get();

        return response()->json([
            'services' => ServiceResource::collection($services),
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'services' => ServiceResource::collection(Service::all()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'service' => new ServiceResource($service),
        ], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $service->update($validated);

        return response()->json([
            'service' => new ServiceResource($service->fresh()),
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }
}
