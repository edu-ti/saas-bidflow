import requests
import json

# ==============================================================================
# CONFIGURATION
# ==============================================================================
# The Bearer Token to access the Laravel API. 
# Generate this using: php artisan api:token {email} {bot_name}
API_TOKEN = 'YOUR_SANCTUM_BEARER_TOKEN'
BASE_URL = 'http://localhost:8000/api'
OPPORTUNITY_ID = 1 # Replace with a valid opportunity ID that belongs to the token's company_id

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

def test_ai_insights():
    print(f"\n[1] Testing AI Insights Webhook for Opportunity #{OPPORTUNITY_ID}...")
    url = f"{BASE_URL}/opportunities/{OPPORTUNITY_ID}/ai-insights"
    
    payload = {
        "insights": {
            "risco_edital": "Alto",
            "exigencia_capital": "R$ 50.000",
            "resumo": "Edital para compra de material médico em Recife. Existem cláusulas super restritivas na área de habilitação fiscal.",
            "data_limite_impugnacao": "25/11/2026"
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ Webhook Success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_bidding_alerts():
    print(f"\n[2] Testing Bidding Alerts (Telegram Trigger) for Opportunity #{OPPORTUNITY_ID}...")
    url = f"{BASE_URL}/alerts"
    
    payload = {
        "opportunity_id": OPPORTUNITY_ID,
        "type": "Phase Change",
        "content" : "O pregoeiro alterou a fase da licitação para 'Homologação'.",
        "raw_data": {"bot_log": "phase_changed", "time_taken": "4ms"}
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            print("✅ Alert Created Success!")
            print("Telegram notification should have been dispatched via Laravel.")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("🤖 BidFlow Bot Simulator Started...")
    test_ai_insights()
    test_bidding_alerts()
