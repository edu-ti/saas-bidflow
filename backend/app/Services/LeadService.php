<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Contact;
use Illuminate\Support\Facades\DB;

class LeadService
{
    /**
     * Create lead with optional contact
     */
    public function createLead(array $data, ?array $contactData = null): Lead
    {
        return DB::transaction(function () use ($data, $contactData) {
            $lead = Lead::create($data);

            if ($contactData) {
                $this->addContact($lead, $contactData);
            }

            return $lead;
        });
    }

    /**
     * Add contact to lead
     */
    public function addContact(Lead $lead, array $contactData): Contact
    {
        $contact = Contact::create([
            'company_id' => $lead->company_id,
            'lead_id' => $lead->id,
            'name' => $contactData['name'],
            'email' => $contactData['email'] ?? null,
            'phone' => $contactData['phone'] ?? null,
            'role' => $contactData['role'] ?? null,
        ]);

        return $contact;
    }

    /**
     * Convert lead to opportunity
     */
    public function convertToOpportunity(Lead $lead, array $opportunityData)
    {
        return DB::transaction(function () use ($lead, $opportunityData) {
            $opportunity = \App\Models\Opportunity::create([
                'company_id' => $lead->company_id,
                'user_id' => auth()->id(),
                'title' => $opportunityData['title'] ?? "Oportunidade - {$lead->name}",
                'description' => $opportunityData['description'] ?? null,
                'estimated_value' => $opportunityData['estimated_value'] ?? null,
                'status' => 'captured',
                'lead_id' => $lead->id,
            ]);

            $lead->update(['status' => 'converted']);

            return $opportunity;
        });
    }

    /**
     * Get leads by temperature
     */
    public function getLeadsByTemperature(int $companyId, string $temperature): array
    {
        return Lead::where('company_id', $companyId)
            ->where('temperature', $temperature)
            ->orderByDesc('created_at')
            ->get()
            ->toArray();
    }
}
