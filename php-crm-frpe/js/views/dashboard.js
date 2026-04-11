// js/views/dashboard.js

import { appState } from '../state.js';
import { apiCall } from '../api.js';
import { showLoading, formatCurrency } from '../utils.js';

export async function renderDashboardView() {
    const container = document.getElementById('dashboard-view');
    try {
        showLoading(true);
        const stats = await apiCall('get_stats');

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                <div class="kpi-card">
                    <h3 class="kpi-title">Oportunidades Totais</h3>
                    <p class="kpi-value">${stats.kpis.total_opps || 0}</p>
                </div>
                 <div class="kpi-card">
                    <h3 class="kpi-title">Valor Total (Pipeline)</h3>
                    <p class="kpi-value">${formatCurrency(stats.kpis.total_value)}</p>
                </div>
                 <div class="kpi-card">
                    <h3 class="kpi-title">Conv. Oportunidades</h3>
                    <p class="kpi-value">${(stats.kpis.conversion_rate || 0).toFixed(2)}%</p>
                </div>
                <div class="kpi-card">
                    <h3 class="kpi-title">Valor Aprovado (Propostas)</h3>
                    <p class="kpi-value">${formatCurrency(stats.kpis.approved_proposals_value)}</p>
                </div>
                 <div class="kpi-card">
                    <h3 class="kpi-title">Ticket Médio</h3>
                    <p class="kpi-value">${formatCurrency(stats.kpis.avg_deal_size)}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div class="lg:col-span-2 chart-container"><div style="height: 400px;"><canvas id="oppsByStageChart"></canvas></div></div>
                <div class="lg:col-span-3 chart-container"><div style="height: 400px;"><canvas id="combinedSalesChart"></canvas></div></div>
            </div>
        `;

        renderChart('oppsByStageChart', 'doughnut', stats.oppsByStage, 'nome', 'count', 'Oportunidades por Etapa');
        renderCombinedSalesChart(stats.oppsByUser, stats.salesByFornecedor);

    } catch (error) {
        container.innerHTML = `<p class="text-red-500">Não foi possível carregar as estatísticas do dashboard.</p>`;
    } finally {
        showLoading(false);
    }
}

function renderChart(canvasId, type, data, labelKey, dataKey, title) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (appState.charts[canvasId]) {
        appState.charts[canvasId].destroy();
    }

    const chartColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#64748b'];

    appState.charts[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: data.map(item => item[labelKey]),
            datasets: [{
                label: title,
                data: data.map(item => item[dataKey]),
                backgroundColor: chartColors,
                borderColor: type === 'doughnut' ? '#fff' : 'transparent',
                borderWidth: type === 'doughnut' ? 2 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: type === 'doughnut' ? 'top' : 'none', labels: { boxWidth: 10, font: { size: 10 } } },
                title: { display: true, text: title, font: { size: 14 } }
            }
        }
    });
}

function renderCombinedSalesChart(oppsData, salesData) {
    const canvasId = 'combinedSalesChart';
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (appState.charts[canvasId]) {
        appState.charts[canvasId].destroy();
    }

    const allLabels = [...new Set([...oppsData.map(d => d.nome), ...salesData.map(d => d.nome)])];

    const oppsDataset = {
        label: 'Oportunidades por Vendedor',
        data: allLabels.map(label => {
            const item = oppsData.find(d => d.nome === label);
            return item ? item.count : 0;
        }),
        backgroundColor: '#4f46e5',
        yAxisID: 'yOpps',
    };

    const salesDataset = {
        label: 'Vendas por Fornecedor (R$)',
        data: allLabels.map(label => {
            const item = salesData.find(d => d.nome === label);
            return item ? item.total_vendido : 0;
        }),
        backgroundColor: '#ef4444',
        yAxisID: 'ySales',
    };

    appState.charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allLabels,
            datasets: [oppsDataset, salesDataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
                title: { display: true, text: 'Oportunidades e Vendas', font: { size: 14 } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'ySales') {
                                label += formatCurrency(context.parsed.y);
                            } else {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                yOpps: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Nº de Oportunidades'
                    },
                    beginAtZero: true
                },
                ySales: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Valor Vendido (R$)'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    beginAtZero: true,
                    ticks: {
                        callback: function (value, index, values) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}
