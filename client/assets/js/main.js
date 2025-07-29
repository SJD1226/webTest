// 全局变量声明
let assetChart, returnChart, radarChart;

// 初始化菜单交互
function initMenuInteraction() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 初始化用户头像交互
function initUserAvatarInteraction() {
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            const userName = prompt('请输入您的姓名:', '');
            if (userName && userName.trim()) {
                const initials = userName.trim().substring(0, 2).toUpperCase();
                this.textContent = initials;
            }
        });
    }
}

// 初始化资产分布饼图
function initAssetChart() {
    const assetCtx = document.getElementById('assetChart').getContext('2d');
    assetChart = new Chart(assetCtx, {
        type: 'pie',
        data: {
            labels: ['股票配置', '债券投资', '货币基金', '另类投资', '现金储备'],
            datasets: [{
                data: [38, 25, 18, 12, 7],
                backgroundColor: [
                    '#2a5dff', 
                    '#0dbd70',
                    '#ff6b6b',
                    '#ffd166',
                    '#a29bfe'
                ],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

// 初始化收益率走势图
function initReturnChart() {
    const returnCtx = document.getElementById('returnChart').getContext('2d');
    returnChart = new Chart(returnCtx, {
        type: 'line',
        data: {
            labels: ['4月', '5月', '6月', '7月'],
            datasets: [
                {
                    label: '投资组合',
                    data: [4.2, 5.0, 6.2, 7.5],
                    borderColor: '#2a5dff',
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: '沪深300',
                    data: [3.2, 4.1, 5.3, 6.0],
                    borderColor: '#ff6b6b',
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: {
                        color: 'rgba(240, 243, 250, 0.8)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 初始化时间筛选交互
function initTimeFilterInteraction() {
    const timeTabs = document.querySelectorAll('.time-tab');
    timeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            timeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 根据选择的时间范围更新数据
            if (this.textContent === '近1月') {
                returnChart.data.labels = ['上周', '本周初', '本周中', '周末'];
                returnChart.data.datasets[0].data = [6.8, 7.0, 7.2, 7.5];
                returnChart.data.datasets[1].data = [5.8, 5.9, 6.0, 6.0];
            } else if (this.textContent === '近3月') {
                returnChart.data.labels = ['4月', '5月', '6月', '7月'];
                returnChart.data.datasets[0].data = [4.2, 5.0, 6.2, 7.5];
                returnChart.data.datasets[1].data = [3.2, 4.1, 5.3, 6.0];
            } else {
                returnChart.data.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
                returnChart.data.datasets[0].data = [1.8, 5.2, 6.8, 7.5];
                returnChart.data.datasets[1].data = [1.2, 4.5, 5.7, 6.0];
            }
            
            returnChart.update();
        });
    });
}

// 初始化刷新按钮交互
function initRefreshButtons() {
    const refreshButtons = document.querySelectorAll('.data-refresh');
    refreshButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const original = this.innerHTML;
            this.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> 更新中...`;
            setTimeout(() => {
                this.innerHTML = original;
                fetchAssetData();
            }, 1000);
        });
    });
}

// 从API获取资产数据
async function fetchAssetData() {
    try {
        const response = await fetch('http://localhost:3001/api/portfolio/my-holdings');
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        console.log("API返回数据:", apiResponse);
        
        // 检查API响应结构
        if (!apiResponse.data) {
            throw new Error("API返回数据中缺少data字段");
        }
        
        // 更新总资产显示
        updateTotalMarketValue(apiResponse.data);
        
        // 更新收益率显示
        updateTotalReturnPercent(apiResponse.data);

        //更新收益显示
        updateTotalProfit(apiResponse.data);

        //更新资产列表
        updateHoldings(apiResponse.data);
        
        console.log('资产数据更新成功');
        return true;
    } catch (error) {
        console.error('获取资产数据失败:', error);
        
        // 显示错误提示
        const errorElement = document.getElementById('api-error');
        if (errorElement) {
            errorElement.textContent = `数据更新失败: ${error.message}`;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
        
        return false;
    }
}

// 拉取评分数据并更新雷达图
async function fetchAndUpdateRadarChart() {
    try {
        const response = await fetch('http://localhost:3001/api/portfolio/rating');
        if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);
        const apiResponse = await response.json();
        if (!apiResponse.data) throw new Error("API返回数据中缺少data字段");

        // 映射API数据到雷达图顺序
        const radarData = [
            apiResponse.data.averageReturnOnAssetsScore,      // 盈利能力
            apiResponse.data.averageDebtToEquityScore,        // 抗风险能力
            apiResponse.data.averageDiscountedCashFlowScore,  // 可复制性
            apiResponse.data.averagePriceToBookScore,         // 持股分散度
            apiResponse.data.averagePriceToEarningsScore      // 稳定性
        ];

        if (radarChart) {
            radarChart.data.datasets[0].data = radarData;
            radarChart.update();
        }
    } catch (error) {
        console.error('获取雷达评分数据失败:', error);
    }
}

// 更新总资产显示
function updateTotalMarketValue(data) {
    try {
        const totalMarketValue = document.getElementById('total-market-value');
        
        if (!totalMarketValue) {
            throw new Error("未找到ID为'total-market-value'的元素");
        }
        
        // 检查totalMarketValue字段是否存在
        if (typeof data.totalMarketValue === 'undefined') {
            throw new Error("API返回数据中缺少totalMarketValue字段");
        }
        
        // 转换为数字
        const totalValue = Number(data.totalMarketValue);
        
        if (isNaN(totalValue)) {
            throw new Error(`totalMarketValue不是有效数字: ${data.totalMarketValue}`);
        }
        
        // 格式化并显示
        totalMarketValue.textContent = `¥${totalValue.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        
        // 重置样式
        totalMarketValue.style.color = "";
        
    } catch (error) {
        console.error("更新总资产时出错:", error);
        const totalMarketValue = document.getElementById('total-market-value');
        if (totalMarketValue) {
            totalMarketValue.textContent = "¥数据异常";
            totalMarketValue.style.color = "red";
        }
    }
}

// 更新收益率显示
function updateTotalReturnPercent(data) {
    try {
        const totalReturnPercent = document.getElementById('total-return-percent');
        const returnChange = document.getElementById('return-change');
    
        if (!totalReturnPercent) {
            throw new Error("未找到收益率显示元素");
        }
        
        // 检查totalReturnPercent字段是否存在
        if (typeof data.totalReturnPercent === 'undefined') {
            throw new Error("API返回数据中缺少totalReturnPercent字段");
        }
        
        // 转换为数字
        const returnValue = Number(data.totalReturnPercent);
        
        if (isNaN(returnValue)) {
            throw new Error(`totalReturnPercent不是有效数字: ${data.totalReturnPercent}`);
        }
        
        // 格式化并显示
        totalReturnPercent.textContent = `${returnValue.toFixed(2)}%`;
        
        // 根据正负设置样式
        if (returnValue >= 0) {
            totalReturnPercent.style.color ="#0dbd70";
            returnChange.textContent = "Positive Returns";
            returnChange.style.color = "#0dbd70";
            returnChange.className = "growth-indicator growth-up";
        } else {
            totalReturnPercent.style.color = "#f1403d";
            returnChange.textContent = "Negative Returns";
            returnChange.style.color = "#f1403d";
            returnChange.className = "growth-indicator growth-down";
        }
        
    } catch (error) {
        console.error("更新收益率时出错:", error);
        const totalReturnPercent = document.getElementById('total-return-percent');
        if (totalReturnPercent) {
            totalReturnPercent.textContent = "数据异常";
            totalReturnPercent.style.color = "red";
        }
    }
}

function updateTotalProfit(data) {
    try {
        const totalProfit = document.getElementById('total-profit');
    
        if (!totalProfit) {
            throw new Error("未找到总收益显示元素"); // 优化错误提示
        }
        
        if (typeof data.totalProfit === 'undefined') {
            throw new Error("API返回数据中缺少totalProfit字段");
        }
        
        const profitValue = Number(data.totalProfit); // 将变量名改为更清晰的 profitValue
        
        if (isNaN(profitValue)) {
            throw new Error(`totalProfit不是有效数字: ${data.totalProfit}`);
        }
        
        // 格式化并显示，不添加百分号
        // 您可能希望根据金额大小进行格式化，例如添加千位分隔符
        totalProfit.textContent = `${profitValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        // 如果需要显示正负号，可以在这里判断并添加
        if (profitValue > 0) {
            totalProfit.textContent = `+${totalProfit.textContent}`;
            totalProfit.style.color = "#0dbd70"; // 假设绿色表示正收益
        } else if (profitValue < 0) {
            totalProfit.style.color = "#f1403d"; // 假设红色表示负收益
        } else {
            totalProfit.style.color = ""; // 默认颜色
        }
        
    } catch (error) {
        console.error("更新总收益时出错:", error);
        const totalProfitElement = document.getElementById('total-profit'); // 修正变量名
        if (totalProfitElement) {
            totalProfitElement.textContent = "数据异常";
            totalProfitElement.style.color = "red";
        }
    }
}

//更新资产列表
function updateHoldings(portfolioData) {
    const holdings = portfolioData.holdings;
    
    // 1. 排序 - 按收益率降序
    const sortedHoldings = [...holdings].sort((a, b) => b.returnPercent - a.returnPercent);
    
    // 2. 获取表格tbody元素
    const tbody = document.querySelector('.table-con tbody');
    tbody.innerHTML = ''; // 清空现有内容
    
    // 3. 生成新行
    sortedHoldings.forEach((holding, index) => {
        const row = document.createElement('tr');
        
        // 资产名称
        const nameCell = document.createElement('td');
        nameCell.className = 'asset-name';
        nameCell.textContent = holding.symbol;
        
        // 持仓
        const positionCell = document.createElement('td');
        positionCell.textContent = holding.quantity;
        
        // 涨跌幅
        const changeCell = document.createElement('td');
        const isPositive = holding.profit >= 0;
        changeCell.className = isPositive ? 'positive-change' : 'negative-change';
        changeCell.textContent = `${isPositive ? '+' : ''}${holding.profit.toFixed(2)}`;
        
        // 排名
        const returnPercent = document.createElement('td');
        const percentisPositive = holding.returnPercent >= 0;
        returnPercent.className = percentisPositive ? 'positive-change' : 'negative-change';
        returnPercent.textContent = `${percentisPositive ? '+' : ''}${holding.returnPercent.toFixed(2)}%`;
        
        
        // 添加到行
        row.appendChild(nameCell);
        row.appendChild(positionCell);
        row.appendChild(changeCell);
        row.appendChild(returnPercent);
        
        // 添加到表格
        tbody.appendChild(row);
    });
    
    // 4. 更新现金余额（如果存在）
    if (portfolioData.cashBalance !== undefined) {
        const cashSpan = document.querySelector('.cash-balance span');
        if (cashSpan) {
            cashSpan.textContent = `现金：${portfolioData.cashBalance}`;
        }
    }

}

async function fetchAssetAllocationData() {
    try {
        const response = await fetch('http://localhost:3001/api/portfolio/asset-allocation');
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP错误! 状态码: ${response.status}, 响应: ${errorText}`);
        }
        
        const apiResponse = await response.json();
        console.log("资产分配API返回数据:", apiResponse); // 调试输出

        if (apiResponse.code !== 200 || !apiResponse.data || !Array.isArray(apiResponse.data)) {
            throw new Error(`API返回数据格式不正确或状态码非200: ${apiResponse.message}`);
        }

        const labels = apiResponse.data.map(item => item.type);
        const percentages = apiResponse.data.map(item => item.percentage);
        
        // 更新资产分布饼图
        if (assetChart) {
            assetChart.data.labels = labels;
            assetChart.data.datasets[0].data = percentages;
            assetChart.update(); // 更新图表 [5, 8, 9, 10]
        }

        // 更新图例（手动更新，因为 Chart.js 默认 legend display 为 false）
        updateAssetChartLegend(apiResponse.data);

        console.log('资产分布数据更新成功');
        return true;

    } catch (error) {
        console.error('获取资产分配数据失败:', error);
        // 您可以显示一个错误提示给用户，例如在图表下方显示“数据加载失败”
        return false;
    }
}

// 辅助函数：更新资产分布图的图例
function updateAssetChartLegend(data) {
    const legendContainer = document.querySelector('.chart-container .legend');
    if (!legendContainer) return;

    legendContainer.innerHTML = ''; // 清空现有图例

    const colors = assetChart.data.datasets[0].backgroundColor; // 获取Chart.js图表使用的颜色

    data.forEach((item, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorDiv = document.createElement('div');
        colorDiv.className = 'legend-color';
        colorDiv.style.backgroundColor = colors[index % colors.length]; // 使用Chart.js的颜色循环
        
        const span = document.createElement('span');
        span.textContent = `${item.type} ${item.percentage.toFixed(2)}%`;
        
        legendItem.appendChild(colorDiv);
        legendItem.appendChild(span);
        legendContainer.appendChild(legendItem);
    });
}

// 页面初始化 - 唯一的初始化入口
document.addEventListener('DOMContentLoaded', function() {
    // --- 交互功能初始化 (只执行一次) ---
    initMenuInteraction();
    initUserAvatarInteraction();
    initTimeFilterInteraction();
    initRefreshButtons();
    
    // --- 图表初始化 (只执行一次) ---
    initAssetChart(); // 初始化空的资产饼图
    initReturnChart(); // 初始化空的收益率折线图

    // --- 雷达图初始化 (来自您的第二个监听器) ---
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['DiscountedCashFlowScore', 'ReturnOnAssetsScore', 'DebtToEquityScore', 'PriceToEarningsScore', 'PriceToBookScore'],
            datasets: [{
                label: 'Rating',
                data: [0, 0, 0, 0, 0], // 初始为0
                fill: true,
                backgroundColor: 'rgba(255, 107, 107, 0.4)',
                borderColor: '#f1403d',
                pointBackgroundColor: '#f1403d',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        display: false
                    },
                    grid: {
                        color: 'rgba(240, 243, 250, 0.8)',
                        lineWidth: 1.5
                    },
                    angleLines: {
                        color: 'rgba(240, 243, 250, 0.8)',
                        lineWidth: 1.5
                    },
                    pointLabels: {
                        display: false,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });


    // --- 首次获取数据 (现在所有的数据获取都在这里) ---
    fetchAssetData();           // 获取投资组合、总收益等数据
    fetchAndUpdateRadarChart();   // 获取雷达图数据
    fetchAssetAllocationData(); // 【关键】获取资产分布饼图数据

    
    // --- 其他交互逻辑 (来自您的第二个监听器) ---
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    document.querySelector('.btn.add').addEventListener('click', function() {
        alert('添加自选股票功能');
    });
    
    document.querySelector('.btn.home').addEventListener('click', function() {
        alert('添加到首页');
    });

    // 如果需要定时刷新，可以在这里统一设置
    // setInterval(fetchAssetData, 30000);
    // setInterval(fetchAssetAllocationData, 30000);
    // setInterval(fetchAndUpdateRadarChart, 30000);
});