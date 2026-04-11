/**
 * Biblioteca de Widgets para Relatórios
 * Integração com Chart.js.
 */
const ReportWidgets = {
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },

    renderChart: (canvasId, data, title, type = 'bar') => {
        const ctx = document.getElementById(canvasId);
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const labels = data.map(item => item.label || 'N/A');
        const values = data.map(item => item.value);
        const counts = data.map(item => item.count);
        const bgColors = labels.map((_, i) => i % 2 === 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(37, 99, 235, 0.7)');

        new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor (R$)',
                    data: values,
                    backgroundColor: bgColors,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: title, font: { size: 16 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null && type !== 'doughnut') {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                }
                                return label;
                            },
                            afterLabel: function(context) { return `Qtd: ${counts[context.dataIndex]}`; }
                        }
                    }
                }
            }
        });
    },

    renderFunnelChart: (canvasId, data) => {
        const ctx = document.getElementById(canvasId);
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const labels = data.map(d => d.label);
        const values = data.map(d => d.count);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Volume',
                    data: values,
                    indexAxis: 'y',
                    backgroundColor: 'rgba(16, 185, 129, 0.7)'
                }]
            },
            options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Funil' } } }
        });
    }
};

window.ReportWidgets = ReportWidgets;
