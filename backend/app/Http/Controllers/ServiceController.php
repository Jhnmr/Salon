<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Get all active services
     */
    public function index()
    {
        $services = Service::where('is_active', true)->get();
        return response()->json(['services' => $services]);
    }

    /**
     * Get a specific service
     */
    public function show($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['error' => 'Service not found'], 404);
        }

        return response()->json(['service' => $service]);
    }

    /**
     * Create a new service (admin only)
     */
    public function store(Request $request)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'category' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $service = Service::create($request->only('name', 'description', 'price', 'duration_minutes', 'category'));

            return response()->json([
                'message' => 'Service created successfully',
                'service' => $service,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create service'], 500);
        }
    }

    /**
     * Update a service (admin only)
     */
    public function update(Request $request, $id)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $service = Service::find($id);

        if (!$service) {
            return response()->json(['error' => 'Service not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_minutes' => 'sometimes|integer|min:1',
            'category' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $service->update($request->only('name', 'description', 'price', 'duration_minutes', 'category', 'is_active'));

            return response()->json([
                'message' => 'Service updated successfully',
                'service' => $service,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update service'], 500);
        }
    }

    /**
     * Delete a service (admin only)
     */
    public function destroy(Request $request, $id)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $service = Service::find($id);

        if (!$service) {
            return response()->json(['error' => 'Service not found'], 404);
        }

        try {
            $service->delete();

            return response()->json(['message' => 'Service deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete service'], 500);
        }
    }

    /**
     * Get services by category
     */
    public function getByCategory($category)
    {
        $services = Service::where('category', $category)
            ->where('is_active', true)
            ->get();

        return response()->json(['services' => $services]);
    }
}
