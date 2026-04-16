"""
BidFlow Bot Simulator - Testador de Integrações IA e Alertas
=============================================================
Este script testa as integrações de IA, alertas Telegram e parsing de editais.

Variáveis de ambiente necessárias:
    BIDFLOW_API_TOKEN: Token de autenticação da API
    BIDFLOW_API_URL: URL base da API (default: http://localhost:8000/api)
    BIDFLOW_OPPORTUNITY_ID: ID da oportunidade para testes (default: 1)
"""

import os
import sys
import json
import requests
from typing import Optional


class BidFlowTester:
    """Classe para testar integrações do BidFlow"""
    
    def __init__(self):
        self.api_token = os.getenv('BIDFLOW_API_TOKEN')
        self.base_url = os.getenv('BIDFLOW_API_URL', 'http://localhost:8000/api')
        self.opportunity_id = int(os.getenv('BIDFLOW_OPPORTUNITY_ID', '1'))
        
        if not self.api_token:
            print("❌ ERRO: Variável BIDFLOW_API_TOKEN não configurada!")
            print("Execute: export BIDFLOW_API_TOKEN='seu-token-aqui'")
            sys.exit(1)
        
        self.headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def _print_header(self, title: str):
        """Imprime cabeçalho formatado"""
        print(f"\n{'='*60}")
        print(f" {title}")
        print(f"{'='*60}")
    
    def _print_success(self, message: str, data: Optional[dict] = None):
        """Imprime mensagem de sucesso"""
        print(f"✅ {message}")
        if data:
            print(json.dumps(data, indent=2, ensure_ascii=False))
    
    def _print_error(self, message: str, response: Optional[requests.Response] = None):
        """Imprime mensagem de erro"""
        print(f"❌ {message}")
        if response:
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
    
    def test_ai_insights(self):
        """Testa webhook de insights de IA"""
        self._print_header(f"[1] Testando AI Insights Webhook - Oportunidade #{self.opportunity_id}")
        url = f"{self.base_url}/opportunities/{self.opportunity_id}/ai-insights"

        payload = {
            "insights": {
                "risco_edital": "Alto",
                "exigencia_capital": "R$ 50.000",
                "resumo": "Edital para compra de material médico em Recife. Existem cláusulas super restritivas na área de habilitação fiscal.",
                "data_limite_impugnacao": "25/11/2026"
            }
        }

        try:
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code in [200, 201]:
                self._print_success("Webhook Success!", response.json())
                return True
            else:
                self._print_error(f"Failed with status {response.status_code}", response)
                return False
                
        except requests.exceptions.ConnectionError:
            self._print_error("Conexão recusada. Verifique se o backend está rodando")
            return False
        except Exception as e:
            self._print_error(f"Exception: {str(e)}")
            return False

    def test_bidding_alerts(self):
        """Testa alertas de licitação com disparo Telegram"""
        self._print_header(f"[2] Testando Bidding Alerts (Telegram Trigger) - Oportunidade #{self.opportunity_id}")
        url = f"{self.base_url}/alerts"

        payload = {
            "opportunity_id": self.opportunity_id,
            "type": "Phase Change",
            "content" : "O pregoeiro alterou a fase da licitação para 'Homologação'.",
            "raw_data": {"bot_log": "phase_changed", "time_taken": "4ms"}
        }

        try:
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code in [200, 201]:
                self._print_success("Alert Created Success! Telegram notification should have been dispatched.")
                return True
            else:
                self._print_error(f"Failed with status {response.status_code}", response)
                return False
                
        except requests.exceptions.ConnectionError:
            self._print_error("Conexão recusada. Verifique se o backend está rodando")
            return False
        except Exception as e:
            self._print_error(f"Exception: {str(e)}")
            return False

    def test_win_predict(self):
        """Testa job de previsão de vitória"""
        self._print_header(f"[3] Testando Win Predict Job - Oportunidade #{self.opportunity_id}")
        url = f"{self.base_url}/opportunities/{self.opportunity_id}/predict"
        
        try:
            response = requests.post(url, headers=self.headers)
            
            if response.status_code == 202:
                self._print_success("Predict Job Dispatched!")
                return True
            else:
                self._print_error(f"Failed with status {response.status_code}", response)
                return False
                
        except Exception as e:
            self._print_error(f"Exception: {str(e)}")
            return False

    def test_parse_notice(self):
        """Testa job de parsing de edital (RAG)"""
        self._print_header(f"[4] Testando Parse Notice Job (RAG) - Oportunidade #{self.opportunity_id}")
        url = f"{self.base_url}/opportunities/{self.opportunity_id}/parse-notice"
        
        try:
            response = requests.post(url, headers=self.headers)
            
            if response.status_code == 202:
                self._print_success("Parse Notice Job Dispatched!")
                return True
            else:
                self._print_error(f"Failed with status {response.status_code}", response)
                return False
                
        except Exception as e:
            self._print_error(f"Exception: {str(e)}")
            return False
    
    def test_pdf_draft_proposal(self):
        """Testa geração de proposta em PDF via IA"""
        self._print_header(f"[5] Testando AI PDF Draft - Oportunidade #{self.opportunity_id}")
        url = f"{self.base_url}/opportunities/{self.opportunity_id}/proposal-draft/pdf"
        
        try:
            response = requests.post(url, headers=self.headers)
            
            if response.status_code == 200:
                # Salvar PDF
                pdf_path = f"proposta_demo_{self.opportunity_id}.pdf"
                with open(pdf_path, 'wb') as f:
                    f.write(response.content)
                self._print_success(f"PDF Draft generated and saved to {pdf_path}")
                return True
            else:
                self._print_error(f"Failed with status {response.status_code}", response)
                return False
                
        except Exception as e:
            self._print_error(f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("\n🤖 BidFlow Bot Simulator - Starting Tests...")
        print(f"   API URL: {self.base_url}")
        print(f"   Opportunity ID: {self.opportunity_id}")
        
        results = {
            'AI Insights': self.test_ai_insights(),
            'Bidding Alerts': self.test_bidding_alerts(),
            'Win Predict': self.test_win_predict(),
            'Parse Notice': self.test_parse_notice(),
            'PDF Draft': self.test_pdf_draft_proposal(),
        }
        
        # Resumo
        print(f"\n{'='*60}")
        print(" 📊 RESUMO DOS TESTES")
        print(f"{'='*60}")
        
        for test_name, success in results.items():
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"   {test_name:20} {status}")
        
        total = len(results)
        passed = sum(1 for v in results.values() if v)
        
        print(f"\n   Total: {passed}/{total} testes passaram")
        print(f"{'='*60}")
        
        return passed == total


def main():
    """Ponto de entrada"""
    import argparse
    
    parser = argparse.ArgumentParser(description='BidFlow Bot Simulator')
    parser.add_argument('--test', type=str, choices=['all', 'insights', 'alerts', 'predict', 'parse', 'pdf'],
                        default='all', help='Teste específico para executar')
    args = parser.parse_args()
    
    tester = BidFlowTester()
    
    if args.test == 'all':
        tester.run_all_tests()
    elif args.test == 'insights':
        tester.test_ai_insights()
    elif args.test == 'alerts':
        tester.test_bidding_alerts()
    elif args.test == 'predict':
        tester.test_win_predict()
    elif args.test == 'parse':
        tester.test_parse_notice()
    elif args.test == 'pdf':
        tester.test_pdf_draft_proposal()


if __name__ == '__main__':
    main()
