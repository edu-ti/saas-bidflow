<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $organizations = Organization::all();
        return OrganizationResource::collection($organizations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:255',
            'uasg_code' => 'nullable|string|max:255',
            'sphere' => 'nullable|in:Federal,Estadual,Municipal',
            'address_data' => 'nullable|array',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $organization = Organization::create($validated);

        return new OrganizationResource($organization);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $organization = Organization::find($id);

        if (! $organization) {
            return response()->json(['message' => 'Organization not found'], 404);
        }

        return new OrganizationResource($organization);
    }
}
