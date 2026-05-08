<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupplierController extends Controller
{
    public function index()
    {
        $companyId = Auth::user()->company_id;
        $suppliers = Supplier::where('company_id', $companyId)->get();
        return response()->json(['data' => $suppliers]);
    }

    public function store(Request $request)
    {
        $companyId = Auth::user()->company_id;
        
        $supplier = Supplier::create([
            'company_id' => $companyId,
            'corporate_name' => $request->corporate_name,
            'fantasy_name' => $request->fantasy_name,
            'cnpj' => $request->cnpj,
            'municipal_registration' => $request->municipal_registration,
            'state_registration' => $request->state_registration,
            'address' => $request->address,
            'contact_name' => $request->contact_name,
            'contact_email' => $request->contact_email,
            'contact_position' => $request->contact_position,
            'contact_phone' => $request->contact_phone,
        ]);

        return response()->json(['data' => $supplier, 'message' => 'Fornecedor criado com sucesso']);
    }

    public function update(Request $request, $id)
    {
        $companyId = Auth::user()->company_id;
        $supplier = Supplier::where('company_id', $companyId)->findOrFail($id);

        $supplier->update([
            'corporate_name' => $request->corporate_name,
            'fantasy_name' => $request->fantasy_name,
            'cnpj' => $request->cnpj,
            'municipal_registration' => $request->municipal_registration,
            'state_registration' => $request->state_registration,
            'address' => $request->address,
            'contact_name' => $request->contact_name,
            'contact_email' => $request->contact_email,
            'contact_position' => $request->contact_position,
            'contact_phone' => $request->contact_phone,
        ]);

        return response()->json(['data' => $supplier, 'message' => 'Fornecedor atualizado com sucesso']);
    }

    public function destroy($id)
    {
        $companyId = Auth::user()->company_id;
        $supplier = Supplier::where('company_id', $companyId)->findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Fornecedor removido com sucesso']);
    }
}