<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'position' => $user->position,
            'avatar' => $user->avatar,
            'department' => $user->department,
            'settings' => $user->settings ?? [],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'avatar' => 'nullable|string|max:500',
            'settings' => 'nullable|array',
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'user' => $user,
        ]);
    }

    public function security(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'two_factor_enabled' => !empty($user->two_factor_secret),
            'has_password' => !empty($user->password),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Senha atual incorreta',
            ], 422);
        }

        $user->update([
            'password' => $validated['new_password'],
        ]);

        return response()->json([
            'message' => 'Senha alterada com sucesso',
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();
        $notifications = $user->settings['notifications'] ?? [
            'new_leads' => true,
            'new_messages' => true,
            'weekly_reports' => true,
        ];

        return response()->json($notifications);
    }

    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'notifications' => 'required|array',
            'notifications.new_leads' => 'nullable|boolean',
            'notifications.new_messages' => 'nullable|boolean',
            'notifications.weekly_reports' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $settings = $user->settings ?? [];
        $settings['notifications'] = $validated['notifications'];

        $user->update(['settings' => $settings]);

        return response()->json([
            'message' => 'Notificações atualizadas com sucesso',
        ]);
    }

    public function whatsapp(Request $request)
    {
        $user = $request->user();
        $whatsapp = $user->settings['whatsapp'] ?? [
            'instance_name' => '',
            'phone' => '',
            'status' => 'disconnected',
            'ignore_voice_calls' => true,
            'auto_read' => true,
        ];

        return response()->json($whatsapp);
    }

    public function updateWhatsapp(Request $request)
    {
        $validated = $request->validate([
            'whatsapp' => 'required|array',
            'whatsapp.instance_name' => 'nullable|string',
            'whatsapp.phone' => 'nullable|string',
            'whatsapp.status' => 'nullable|string',
            'whatsapp.ignore_voice_calls' => 'nullable|boolean',
            'whatsapp.auto_read' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $settings = $user->settings ?? [];
        $settings['whatsapp'] = $validated['whatsapp'];

        $user->update(['settings' => $settings]);

        return response()->json([
            'message' => 'Configurações do WhatsApp atualizadas com sucesso',
        ]);
    }
}