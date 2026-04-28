<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $query = Conversation::where('company_id', $request->user()->company_id)
            ->with(['assignedUser', 'flow']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('channel') && $request->channel) {
            $query->where('channel', $request->channel);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('contact_name', 'like', "%{$request->search}%")
                    ->orWhere('contact_email', 'like', "%{$request->search}%")
                    ->orWhere('contact_phone', 'like', "%{$request->search}%");
            });
        }

        $conversations = $query->orderBy('updated_at', 'desc')->paginate(20);

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'channel' => 'nullable|in:whatsapp,telegram,widget,email',
            'chatbot_flow_id' => 'nullable|exists:chatbot_flows,id',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $validated['channel'] = $validated['channel'] ?? 'widget';
        $validated['status'] = 'active';

        $conversation = Conversation::create($validated);

        return response()->json([
            'message' => 'Conversa criada com sucesso',
            'conversation' => $conversation->load('messages'),
        ], 201);
    }

    public function show($id)
    {
        $conversation = Conversation::with(['messages.sender', 'assignedUser', 'flow'])->findOrFail($id);
        return response()->json($conversation);
    }

    public function update(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);

        $validated = $request->validate([
            'contact_name' => 'sometimes|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'status' => 'sometimes|in:active,closed,pending',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $conversation->update($validated);

        return response()->json([
            'message' => 'Conversa atualizada com sucesso',
            'conversation' => $conversation,
        ]);
    }

    public function destroy($id)
    {
        $conversation = Conversation::findOrFail($id);
        $conversation->delete();

        return response()->json(['message' => 'Conversa deletada com sucesso']);
    }

    public function messages(Request $request, $conversationId)
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'message_type' => 'nullable|in:text,image,file,audio,video',
        ]);

        $conversation = Conversation::findOrFail($conversationId);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $request->user()->id,
            'sender_type' => 'user',
            'content' => $validated['content'],
            'direction' => 'outbound',
            'message_type' => $validated['message_type'] ?? 'text',
        ]);

        $conversation->touch();

        return response()->json([
            'message' => 'Mensagem enviada com sucesso',
            'data' => $message,
        ], 201);
    }

    public function markRead(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        Message::where('conversation_id', $conversationId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Mensagens marcadas como lidas']);
    }

    public function stats(Request $request)
    {
        $companyId = $request->user()->company_id;

        $stats = [
            'total' => Conversation::where('company_id', $companyId)->count(),
            'active' => Conversation::where('company_id', $companyId)->where('status', 'active')->count(),
            'pending' => Conversation::where('company_id', $companyId)->where('status', 'pending')->count(),
            'closed' => Conversation::where('company_id', $companyId)->where('status', 'closed')->count(),
            'messages_today' => Message::whereHas('conversation', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })->whereDate('created_at', today())->count(),
        ];

        return response()->json($stats);
    }
}