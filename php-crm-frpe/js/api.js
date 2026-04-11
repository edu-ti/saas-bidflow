// js/api.js

import { showToast } from './utils.js';

const API_URL = 'api.php';

export async function apiCall(action, options = {}) {
    try {
        const isFormData = options.body instanceof FormData;
        
        let url = `${API_URL}?action=${action}`;

        if ((!options.method || options.method.toUpperCase() === 'GET') && options.params) {
            const queryParams = new URLSearchParams(options.params).toString();
            url += `&${queryParams}`;
        }

        const fetchOptions = {
            method: options.method || 'GET',
            ...options,
        };

        if (fetchOptions.method.toUpperCase() !== 'GET' && !isFormData) {
             fetchOptions.headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
        }
        
        if(fetchOptions.method.toUpperCase() === 'GET'){
            delete fetchOptions.body;
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson = {};
            try { errorJson = JSON.parse(errorText); } catch (e) { /* Ignore */ }

            if (errorJson.details) {
                 throw new Error(`Erro no servidor: ${errorJson.details.message} em ${errorJson.details.file} na linha ${errorJson.details.line}`);
            } else if (errorJson.error) {
                 throw new Error(`Erro ${response.status}: ${errorJson.error}`);
            } else {
                 throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        }

        const responseText = await response.text();
        if (responseText.trim() === '') return { success: true };

        const result = JSON.parse(responseText);
        if (result.error) throw new Error(result.error);
        if (result.success === false) throw new Error(result.error || 'A API indicou uma falha.');
        
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        console.error(`Falha na API (${action}):`, error);
        throw error;
    }
}
