// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.classList.add('hidden');
            }

            const formData = new FormData(e.target);
            const email = formData.get('email');
            const senha = formData.get('password');

            if (!email || !senha) {
                if(messageDiv) {
                    messageDiv.textContent = 'Por favor, preencha o email e a senha.';
                    messageDiv.classList.remove('hidden');
                }
                return;
            }
            
            try {
                const response = await fetch('api.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = 'index.php';
                } else {
                    if(messageDiv) {
                        messageDiv.textContent = result.error || 'Erro desconhecido.';
                        messageDiv.classList.remove('hidden');
                    }
                }
            } catch (error) {
                console.error('Erro no login:', error);
                if(messageDiv){
                    messageDiv.textContent = 'Não foi possível conectar ao servidor.';
                    messageDiv.classList.remove('hidden');
                }
            }
        });
    }
});
