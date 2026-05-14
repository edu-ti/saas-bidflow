<?php

namespace App\Http\Controllers;

use App\Models\BiddingFilter;
use Illuminate\Http\Request;
use App\Http\Resources\BiddingFilterResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class BiddingFilterController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', BiddingFilter::class);
        $filters = BiddingFilter::latest()->where('company_id', Auth::user()->company_id)->get();
        return BiddingFilterResource::collection($filters);
    }

    public function store(Request $request)
    {
        $this->authorize('create', BiddingFilter::class);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'keywords' => 'nullable|array',
            'portals' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $filter = BiddingFilter::create($validated);
        return new BiddingFilterResource($filter);
    }

    public function show($id)
    {
        $biddingFilter = BiddingFilter::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $biddingFilter);
        return new BiddingFilterResource($biddingFilter);
    }

    public function update(Request $request, $id)
    {
        $biddingFilter = BiddingFilter::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $biddingFilter);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'keywords' => 'nullable|array',
            'portals' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $biddingFilter->update($validated);
        return new BiddingFilterResource($biddingFilter);
    }

    public function destroy($id)
    {
        $biddingFilter = BiddingFilter::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $biddingFilter);
        $biddingFilter->delete();
        return response()->noContent();
    }
}
