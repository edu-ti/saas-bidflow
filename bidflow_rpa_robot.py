import os
import requests
from playwright.sync_api import sync_playwright

API_TOKEN = os.getenv('BIDFLOW_API_TOKEN', '1|wcTh7UzYz5v4iPNOPAb6iu3U6fVHmqJh8TSMpUTW25257397')
BASE_URL = os.getenv('BIDFLOW_API_URL', 'http://localhost:8000/api')
OPPORTUNITY_ID = 1

def run_scraper():
    print("Iniciando Robo RPA BidFlow (Playwright)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Acessando Portal de Compras Publicas (Mock/Comprasnet)...")
        # Idealmente, iríamos para comprasnet.gov.br
        # Para demonstração da arquitetura, simulamos o fluxo c/ timeout ou page.goto
        
        print("Pesquisando termo 'Material Hospitalar'...")
        # page.fill('input[name="pesquisa"]', 'Material Hospitalar')
        # page.click('button[type="submit"]')
        
        print("Localizado: Edital N 45/2026 - GC Representacoes (Saude)")
        print("Descarregando Edital em PDF...")
        
        # Simulando download de um PDF fictício que geramos localmente
        pdf_path = "edital_downloaded.pdf"
        with open(pdf_path, 'wb') as f:
            f.write(b"%PDF-1.4 Mock PDF Content - Edital Hospitalar")
        
        print("Enviando para o Laravel via Multipart Upload...")
        url = f"{BASE_URL}/opportunities/{OPPORTUNITY_ID}/attachments"
        headers = {
            'Authorization': f'Bearer {API_TOKEN}'
            # Não adicione 'Content-Type': 'multipart/form-data', o requests define sozinho com o boundary!
        }
        
        with open(pdf_path, 'rb') as f:
            files = {'file': ('edital_downloaded.pdf', f, 'application/pdf')}
            response = requests.post(url, headers=headers, files=files)
            
            if response.status_code == 200:
                print("Upload concluido com Sucesso!")
                print("Resposta da API:", response.json())
            else:
                print(f"Falha no Upload: {response.status_code} - {response.text}")
                
        browser.close()

if __name__ == '__main__':
    run_scraper()
