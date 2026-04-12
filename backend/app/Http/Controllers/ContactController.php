<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use App\Http\Resources\ContactResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ContactController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Contact::class);
        $contacts = Contact::latest()->get();
        return ContactResource::collection($contacts);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Contact::class);
        $validated = $request->validate([
            'lead_id' => 'nullable|exists:leads,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
        ]);

        $contact = Contact::create($validated);
        return new ContactResource($contact);
    }

    public function show(Contact $contact)
    {
        $this->authorize('view', $contact);
        return new ContactResource($contact);
    }

    public function update(Request $request, Contact $contact)
    {
        $this->authorize('update', $contact);
        $validated = $request->validate([
            'lead_id' => 'nullable|exists:leads,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
        ]);

        $contact->update($validated);
        return new ContactResource($contact);
    }

    public function destroy(Contact $contact)
    {
        $this->authorize('delete', $contact);
        $contact->delete();
        return response()->noContent();
    }
}
