"""
BidFlow RPA Robot - Robô de Automação para Raspagem de Editais de Licitação
==========================================================================
Este robô utiliza Playwright para acessar portais de compras públicas,
pesquisar licitações, baixar editais em PDF e enviar para o backend Laravel.

Variáveis de ambiente necessárias:
    BIDFLOW_API_TOKEN: Token de autenticação da API
    BIDFLOW_API_URL: URL base da API (default: http://localhost:8000/api)
    BIDFLOW_SEARCH_TERM: Termo de pesquisa (default: Material Hospitalar)
    BIDFLOW_OPPORTUNITY_ID: ID da oportunidade (default: 1)
    BIDFLOW_HEADLESS: Modo headless do navegador (default: true)
    BIDFLOW_TIMEOUT: Timeout em segundos (default: 30)
"""

import os
import sys
import time
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
from typing import Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuração de Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'bidflow_robot_{datetime.now().strftime("%Y%m%d")}.log')
    ]
)
logger = logging.getLogger('BidFlowRobot')


class BidFlowConfig:
    """Classe para centralizar configurações do robô"""
    
    def __init__(self):
        self.api_token = os.getenv('BIDFLOW_API_TOKEN')
        self.base_url = os.getenv('BIDFLOW_API_URL', 'http://localhost:8000/api')
        self.search_term = os.getenv('BIDFLOW_SEARCH_TERM', 'Material Hospitalar')
        self.opportunity_id = int(os.getenv('BIDFLOW_OPPORTUNITY_ID', '1'))
        self.headless = os.getenv('BIDFLOW_HEADLESS', 'true').lower() == 'true'
        self.timeout = int(os.getenv('BIDFLOW_TIMEOUT', '30'))
        self.download_dir = os.getenv('BIDFLOW_DOWNLOAD_DIR', './downloads')
        self.max_retries = int(os.getenv('BIDFLOW_MAX_RETRIES', '3'))
        self.retry_delay = int(os.getenv('BIDFLOW_RETRY_DELAY', '5'))
        
        # Portais suportados
        self.supported_portals = {
            'comprasnet': 'https://www.comprasnet.gov.br/',
            'comprasnet_br': 'https://www.gov.br/compras/pt-br',
            'tce_sp': 'https://www.tce.sp.gov.br/',
        }
    
    def validate(self) -> bool:
        """Valida configurações obrigatórias"""
        if not self.api_token:
            logger.error("Variável BIDFLOW_API_TOKEN não configurada!")
            logger.info("Execute: export BIDFLOW_API_TOKEN='seu-token-aqui'")
            return False
        return True


class BidFlowAPI:
    """Cliente para comunicação com a API Laravel"""
    
    def __init__(self, config: BidFlowConfig):
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {config.api_token}',
            'Accept': 'application/json',
        })
    
    def upload_attachment(self, opportunity_id: int, file_path: str, description: str = '') -> Optional[dict]:
        """Envia anexo para uma oportunidade"""
        url = f"{self.config.base_url}/opportunities/{opportunity_id}/attachments"
        
        try:
            with open(file_path, 'rb') as f:
                files = {
                    'file': (os.path.basename(file_path), f, 'application/pdf')
                }
                data = {'description': description} if description else {}
                
                response = self.session.post(url, files=files, data=data)
                response.raise_for_status()
                
                logger.info(f"Upload concluído: {os.path.basename(file_path)}")
                return response.json()
                
        except requests.exceptions.HTTPError as e:
            logger.error(f"Erro HTTP no upload: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Erro no upload: {str(e)}")
            return None
    
    def create_opportunity(self, data: dict) -> Optional[dict]:
        """Cria nova oportunidade"""
        url = f"{self.config.base_url}/opportunities"
        
        try:
            response = self.session.post(url, json=data)
            response.raise_for_status()
            logger.info(f"Oportunidade criada: {data.get('title', 'N/A')}")
            return response.json()
        except Exception as e:
            logger.error(f"Erro ao criar oportunidade: {str(e)}")
            return None
    
    def get_opportunity(self, opportunity_id: int) -> Optional[dict]:
        """Busca dados de uma oportunidade"""
        url = f"{self.config.base_url}/opportunities/{opportunity_id}"
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return response.json().get('data')
        except Exception as e:
            logger.error(f"Erro ao buscar oportunidade: {str(e)}")
            return None


class ComprasnetScraper:
    """Scraper especializado para o portal Comprasnet"""
    
    def __init__(self, config: BidFlowConfig, api: BidFlowAPI):
        self.config = config
        self.api = api
        self.playwright = None
        self.browser = None
        self.page = None
    
    def setup_browser(self):
        """Configura e inicia o navegador"""
        self.playwright = sync_playwright().start()
        
        browser_args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
        ]
        
        self.browser = self.playwright.chromium.launch(
            headless=self.config.headless,
            args=browser_args
        )
        
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BidFlowRobot/1.0'
        )
        
        self.page = context.new_page()
        self.page.set_default_timeout(self.config.timeout * 1000)
        
        logger.info("Navegador configurado com sucesso")
    
    def close_browser(self):
        """Fecha o navegador e limpa recursos"""
        try:
            if self.page:
                self.page.close()
            if self.browser:
                self.browser.close()
            if self.playwright:
                self.playwright.stop()
            logger.info("Navegador fechado")
        except Exception as e:
            logger.error(f"Erro ao fechar navegador: {str(e)}")
    
    def search_biddings(self, search_term: str) -> list[dict]:
        """Pesquisa licitações no portal Comprasnet"""
        logger.info(f"Pesquisando termo: '{search_term}'")
        
        try:
            # Acessar portal de compras
            self.page.goto('https://www.gov.br/compras/pt-br', wait_until='domcontentloaded')
            logger.info("Portal de compras acessado")
            
            # Aguardar carregamento
            time.sleep(2)
            
            # Tentar preencher campo de pesquisa (seletor genérico)
            search_selectors = [
                'input[name="pesquisa"]',
                'input[placeholder*="pesquisar" i]',
                'input[type="search"]',
                '#search-input',
            ]
            
            search_input = None
            for selector in search_selectors:
                try:
                    search_input = self.page.wait_for_selector(selector, timeout=5000)
                    if search_input:
                        break
                except PlaywrightTimeout:
                    continue
            
            if search_input:
                search_input.fill(search_term)
                logger.info(f"Termo '{search_term}' preenchido")
                
                # Submeter pesquisa
                submit_selectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Pesquisar")',
                ]
                
                for selector in submit_selectors:
                    try:
                        submit_btn = self.page.wait_for_selector(selector, timeout=3000)
                        if submit_btn:
                            submit_btn.click()
                            logger.info("Pesquisa submetida")
                            break
                    except PlaywrightTimeout:
                        continue
                
                # Aguardar resultados
                time.sleep(3)
            
            # Extrair resultados
            results = self._extract_bidding_results()
            logger.info(f"Encontrados {len(results)} resultados")
            
            return results
            
        except Exception as e:
            logger.error(f"Erro na pesquisa: {str(e)}")
            return []
    
    def _extract_bidding_results(self) -> list[dict]:
        """Extrai resultados da página de pesquisa"""
        results = []
        
        try:
            # Seletores genéricos para resultados
            result_selectors = [
                '.resultado-item',
                '.licitacao-item',
                '[class*="result"]',
                'table tr',
            ]
            
            for selector in result_selectors:
                elements = self.page.query_selector_all(selector)
                if elements:
                    for elem in elements:
                        result = {
                            'title': elem.inner_text()[:200],
                            'url': self.page.url,
                            'search_term': self.config.search_term,
                            'scraped_at': datetime.now().isoformat(),
                        }
                        results.append(result)
                    break
            
        except Exception as e:
            logger.warning(f"Erro ao extrair resultados: {str(e)}")
        
        return results
    
    def download_edital_pdf(self, opportunity_url: str, output_path: str) -> bool:
        """Baixa PDF do edital"""
        try:
            logger.info(f"Baixando edital: {opportunity_url}")
            
            # Navegar para URL do edital
            self.page.goto(opportunity_url, wait_until='domcontentloaded')
            time.sleep(2)
            
            # Tentar clicar em link de download
            download_links = [
                'a[href$=".pdf"]',
                'a:has-text("edital")',
                'a:has-text("baixar")',
                'a:has-text("download")',
            ]
            
            for selector in download_links:
                try:
                    with self.page.expect_download(timeout=10000) as download_info:
                        self.page.click(selector)
                    download = download_info.value
                    download.save_as(output_path)
                    logger.info(f"PDF salvo: {output_path}")
                    return True
                except PlaywrightTimeout:
                    continue
            
            # Fallback: gerar PDF da página
            self.page.pdf(path=output_path)
            logger.info(f"PDF gerado da página: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao baixar PDF: {str(e)}")
            return False


class BidFlowRobot:
    """Robô principal BidFlow - Orquestrador"""
    
    def __init__(self):
        self.config = BidFlowConfig()
        
        if not self.config.validate():
            sys.exit(1)
        
        self.api = BidFlowAPI(self.config)
        self.scraper = ComprasnetScraper(self.config, self.api)
        
        # Criar diretório de downloads
        Path(self.config.download_dir).mkdir(parents=True, exist_ok=True)
    
    def run(self, search_term: Optional[str] = None):
        """Executa o robô completo"""
        term = search_term or self.config.search_term
        logger.info(f"{'='*60}")
        logger.info(f"BidFlow Robot - Iniciando execução")
        logger.info(f"Termo de pesquisa: {term}")
        logger.info(f"{'='*60}")
        
        try:
            # 1. Configurar navegador
            self.scraper.setup_browser()
            
            # 2. Pesquisar licitações
            results = self.scraper.search_biddings(term)
            
            if not results:
                logger.warning("Nenhum resultado encontrado")
                return
            
            # 3. Processar cada resultado
            for idx, result in enumerate(results, 1):
                logger.info(f"Processando resultado {idx}/{len(results)}")
                
                # Gerar caminho do arquivo
                filename = f"edital_{idx}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                pdf_path = os.path.join(self.config.download_dir, filename)
                
                # Tentar baixar PDF
                success = self.scraper.download_edital_pdf(result['url'], pdf_path)
                
                if success and os.path.exists(pdf_path):
                    # Enviar para API
                    description = f"Edital raspado automaticamente - {result.get('title', 'N/A')}"
                    upload_result = self.api.upload_attachment(
                        self.config.opportunity_id,
                        pdf_path,
                        description
                    )
                    
                    if upload_result:
                        logger.info(f"✅ Resultado {idx} processado com sucesso")
                    else:
                        logger.error(f"❌ Falha no upload do resultado {idx}")
                else:
                    logger.warning(f"⚠️ Falha ao baixar PDF do resultado {idx}")
                
                # Delay entre requests
                time.sleep(2)
            
            logger.info(f"{'='*60}")
            logger.info(f"BidFlow Robot - Execução concluída")
            logger.info(f"Total processado: {len(results)} resultados")
            logger.info(f"{'='*60}")
            
        except Exception as e:
            logger.error(f"Erro fatal na execução: {str(e)}", exc_info=True)
            sys.exit(1)
        finally:
            self.scraper.close_browser()
    
    def run_demo_mode(self):
        """Modo demonstração - simula o fluxo completo"""
        logger.info("Modo demonstração ativado")
        
        pdf_path = os.path.join(self.config.download_dir, 'edital_demo.pdf')
        
        # Criar PDF de demonstração
        with open(pdf_path, 'w') as f:
            f.write(f"""
            EDITAL DE DEMONSTRAÇÃO - BIDFLOW
            ================================
            Termo de pesquisa: {self.config.search_term}
            Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
            
            Este é um arquivo de demonstração gerado automaticamente
            pelo BidFlow RPA Robot.
            """)
        
        logger.info(f"PDF de demonstração gerado: {pdf_path}")
        
        # Enviar para API
        description = f"Edital demo - Pesquisa: {self.config.search_term}"
        result = self.api.upload_attachment(
            self.config.opportunity_id,
            pdf_path,
            description
        )
        
        if result:
            logger.info("✅ Demonstração concluída com sucesso!")
            logger.info(f"Resposta da API: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            logger.error("❌ Falha na demonstração")


def main():
    """Ponto de entrada do robô"""
    import argparse
    
    parser = argparse.ArgumentParser(description='BidFlow RPA Robot')
    parser.add_argument('--search', type=str, help='Termo de pesquisa')
    parser.add_argument('--demo', action='store_true', help='Modo demonstração')
    parser.add_argument('--portal', type=str, choices=['comprasnet', 'tce_sp'], default='comprasnet')
    args = parser.parse_args()
    
    robot = BidFlowRobot()
    
    if args.demo:
        robot.run_demo_mode()
    else:
        robot.run(search_term=args.search)


if __name__ == '__main__':
    main()
