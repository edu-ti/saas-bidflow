// js/utils.js

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    const toast = document.createElement('div');
    toast.className = `toast-item text-white p-3 rounded-md shadow-lg ${colors[type]}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

export function showLoading(isLoading) {
    const spinner = document.getElementById('loading-spinner');
    if (isLoading) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

export function formatCurrency(value) {
    const number = parseFloat(value);
    if (isNaN(number)) return 'R$ 0,00';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// CORREÇÃO: Função parseCurrency atualizada para um modelo mais robusto
// que lida com o formato de moeda brasileiro (ex: "1.234,56").
export function parseCurrency(value) {
if (typeof value === 'number') {
        return value;
    }
    if (typeof value !== 'string') {
        value = String(value);
    }
    
    value = value.replace("R$", "").replace(/\s/g, ''); // Remove R$ e espaços

    // Verifica se o formato é Brasileiro (1.234,56) ou Americano/DB (1234.56)
    const hasComma = value.includes(',');
    const hasPoint = value.includes('.');

    let numberString;

    if (hasComma && hasPoint) {
        // Formato Brasileiro: 1.234,56
        numberString = value.replace(/\./g, '').replace(',', '.');
    } else if (hasComma && !hasPoint) {
        // Formato Brasileiro sem milhar: 1234,56
        numberString = value.replace(',', '.');
    } else if (!hasComma && hasPoint) {
        // Formato Americano/DB: 1234.56
        // Se houver mais de um ponto, é provável que seja BRL formatado errado (ex: 1.234.56)
        if (value.split('.').length > 2) {
             numberString = value.replace(/\./g, ''); // Trata 1.234.56 como 123456
        } else {
             numberString = value; // Trata 1234.56 como 1234.56
        }
    } else {
        // Sem ponto ou vírgula: 1234
        numberString = value;
    }

    const number = parseFloat(numberString);
    return isNaN(number) ? 0 : number;
}
// --- FIM DA ALTERAÇÃO ---



// CORREÇÃO: Função formatCurrencyForInput atualizada para exibir corretamente
// o valor numérico no campo de texto, incluindo o zero.
export function formatCurrencyForInput(value) {
    const number = parseFloat(value);
    if (isNaN(number)) return '';
    // Formata o número para ter sempre duas casas decimais e usa a vírgula como separador.
    return number.toFixed(2).replace('.', ',');
}


export function formatDate(dateString) {
    if(!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function calculateTimeInStage(lastMoveDate) {
    if(!lastMoveDate) return { days: 0, text: 'N/A' };
    const now = new Date();
    const lastMove = new Date(lastMoveDate);
    const diffMs = now - lastMove;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { days: 0, text: 'Hoje' };
    if (diffDays === 1) return { days: 1, text: '1 dia' };
    return { days: diffDays, text: `${diffDays} dias` };
}

export async function setupApiFetch(form, type, apiCall) {
    const input = form.querySelector(`input[name="${type}"]`);
    const button = form.querySelector(`button[data-type="${type}"]`);

    if (!input || !button) return;

    button.addEventListener('click', async () => {
        const value = input.value;
        if (!value) return;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        try {
            const result = await apiCall(`fetch_${type}`, { params: { [type]: value } });
            if (result.success) {
                const data = result.data;
                if (type === 'cnpj') {
                    form.querySelector('input[name="nome_fantasia"]').value = data.fantasia || '';
                    form.querySelector('input[name="razao_social"]').value = data.nome || '';
                    form.querySelector('input[name="cep"]').value = (data.cep || '').replace(/\D/g,'');
                    form.querySelector('input[name="logradouro"]').value = data.logradouro || '';
                    form.querySelector('input[name="numero"]').value = data.numero || '';
                    form.querySelector('input[name="bairro"]').value = data.bairro || '';
                    form.querySelector('input[name="cidade"]').value = data.municipio || '';
                    form.querySelector('input[name="estado"]').value = data.uf || '';
                } else if (type === 'cep') {
                    form.querySelector('input[name="logradouro"]').value = data.logradouro || '';
                    form.querySelector('input[name="bairro"]').value = data.bairro || '';
                    form.querySelector('input[name="cidade"]').value = data.localidade || '';
                    form.querySelector('input[name="estado"]').value = data.uf || '';
                }
            }
        } catch(error) {
            // handled by apiCall
        } finally {
            button.innerHTML = `<i class="fas fa-search"></i>`;
        }
    });
}
