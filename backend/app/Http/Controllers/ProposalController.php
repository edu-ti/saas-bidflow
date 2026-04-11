<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\ProposalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Attachment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProposalController extends Controller
{
    /**
     * Store a newly created proposal and its items.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opportunity_id' => 'required|exists:opportunities,id',
            'status' => 'nullable|in:Draft,Sent,Accepted,Rejected',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.brand' => 'nullable|string',
            'items.*.model' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $totalValue = 0;

            // Compute total value from items
            foreach ($validated['items'] as $item) {
                $totalValue += ($item['quantity'] * $item['unit_price']);
            }

            $proposal = Proposal::create([
                'opportunity_id' => $validated['opportunity_id'],
                'status' => $validated['status'] ?? 'Draft',
                'total_value' => $totalValue,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                $itemTotalPrice = $itemData['quantity'] * $itemData['unit_price'];

                ProposalItem::create([
                    'proposal_id' => $proposal->id,
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemTotalPrice,
                    'brand' => $itemData['brand'] ?? null,
                    'model' => $itemData['model'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json($proposal->load('items'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create proposal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF for a Proposal and save to attachments.
     */
    public function generatePdf($id)
    {
        $proposal = Proposal::with(['items', 'company', 'opportunity.organization'])->find($id);

        if (!$proposal) {
            return response()->json(['message' => 'Proposal not found'], 404);
        }

        $opportunity = $proposal->opportunity;

        // Ensure user has access
        if ($proposal->company_id !== auth()->user()->company_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Render PDF from Blade
        $pdf = Pdf::loadView('pdfs.proposal', [
            'proposal' => $proposal,
            'items' => $proposal->items,
            'company' => $proposal->company,
            'opportunity' => $opportunity,
            'organization' => $opportunity->organization ?? null
        ]);

        $fileName = 'Proposta_' . Str::slug($opportunity->title) . '_' . date('Y_m_d_His') . '.pdf';
        $filePath = 'proposals/' . $proposal->company_id . '/' . $fileName;

        // Save file to storage disk
        Storage::disk('local')->put($filePath, $pdf->output());

        // Log attachment to the database
        $attachment = Attachment::create([
            'company_id' => $proposal->company_id,
            'opportunity_id' => $opportunity->id,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'type' => 'Anexo de Proposta'
        ]);

        return response()->json([
            'message' => 'PDF generated and saved successfully',
            'attachment' => $attachment
        ]);
    }
}
