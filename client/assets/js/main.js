// 全局变量声明
let assetChart, returnChart, radarChart;

// --- 新增 ---
// 用于存储从API获取的近1月真实业绩数据
let monthlyPerformanceData = null; 

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
             labels: ['Stock Allocation', 'Bond Investment', 'Money Market Fund', 'Alternative Investment', 'Cash Reserve'],
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

function initReturnChart() {
    const returnCtx = document.getElementById('returnChart').getContext('2d');
    returnChart = new Chart(returnCtx, {
        type: 'line',
        data: {
            labels: [], // 初始标签为空
            datasets: [
                {
                    label: 'My Assets',
                    data: [], // 初始数据为空
                    borderColor: '#2a5dff',
                    tension: 0.3,
                    pointRadius: 0, // 在数据点多的时候可以不显示点
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'S & P 500', // 您可以根据实际的基准指数修改
                    data: [], // 初始数据为空
                    borderColor: '#ff6b6b',
                    tension: 0.3,
                    pointRadius: 0,
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
                            return value.toFixed(2) + '%'; // 统一保留两位小数
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                         // 当数据点很多时，自动跳过一些标签以避免重叠
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // 我们使用HTML自定义的图例
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// --- 【新增】带种子的随机数生成器 ---
// 这个函数接收一个数字（种子），并返回一个新的、可预测的随机数函数。
function createSeededRandom(seed) {
    let a = seed;
    // 返回一个函数，其行为类似 Math.random()，但结果是可预测的
    return function() {
        // 这是一种常见的、简单的PRNG算法 (Mulberry32)
        a += 0x6D2B79F5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// --- 【全新升级版】可复现的随机数据生成器 ---
function generateRandomPerformanceData(days, seed) { // 【修改】新增了 seed 参数
    const data = [];
    let cumulativePortfolioReturn = 0;
    let cumulativeBenchmarkReturn = 0;

    // --- 【修改】使用我们的种子创建可预测的随机函数 ---
    const random = createSeededRandom(seed);

    // --- 模拟参数设定 (无修改) ---
    const marketYearlyReturn = 0.08;
    const marketYearlyVolatility = 0.20;
    const marketDailyDrift = marketYearlyReturn / 252;
    const marketDailyVolatility = marketYearlyVolatility / Math.sqrt(252);
    const portfolioBeta = 1.1;
    const portfolioAlphaDrift = 0.0001;
    const portfolioAlphaVolatility = 0.008;

    for (let i = 0; i < days; i++) {
        // --- 【修改】将所有的 Math.random() 替换为我们自己的 random() ---
        const benchmarkRandomComponent = (random() + random() + random() - 1.5);
        let benchmarkDailyChange = marketDailyDrift + benchmarkRandomComponent * marketDailyVolatility;

        const portfolioRandomComponent = (random() - 0.5) * 2;
        const alphaComponent = portfolioAlphaDrift + portfolioRandomComponent * portfolioAlphaVolatility;
        const betaComponent = portfolioBeta * (benchmarkDailyChange - marketDailyDrift);
        let portfolioDailyChange = marketDailyDrift + betaComponent + alphaComponent;

        if (random() < 0.03) { // 【修改】
            const shockMultiplier = (random() > 0.5 ? 1 : -1) * (2 + random() * 2); // 【修改】
            if (random() > 0.5) { // 【修改】
                 portfolioDailyChange *= shockMultiplier;
            } else {
                 portfolioDailyChange *= shockMultiplier;
                 benchmarkDailyChange *= shockMultiplier * 0.8;
            }
        }

        cumulativePortfolioReturn += portfolioDailyChange * 100;
        cumulativeBenchmarkReturn += benchmarkDailyChange * 100;

        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        
        data.push({
            date: date.toISOString().split('T')[0],
            dailyReturnPercentage: cumulativePortfolioReturn,
            benchmarkReturnPercentage: cumulativeBenchmarkReturn
        });
    }
    return data;
}


// --- 【修正版】统一更新收益率走势图的逻辑 ---
function updateReturnChart(timeframe) {
    let performanceData;

    switch (timeframe) {
        case '1m':
            if (monthlyPerformanceData) {
                // --- 主要修正开始 ---
                // 我们需要将API返回的每日数据转换为累积数据
                let cumulativePortfolio = 0;
                let cumulativeBenchmark = 0;
                
                performanceData = monthlyPerformanceData.map(dailyData => {
                    cumulativePortfolio += dailyData.dailyReturnPercentage;
                    cumulativeBenchmark += dailyData.benchmarkReturnPercentage;
                    
                    // 返回一个新的对象，包含累积值
                    return {
                        date: dailyData.date,
                        // 使用新的属性名，以便和下面的提取代码保持一致
                        dailyReturnPercentage: cumulativePortfolio, 
                        benchmarkReturnPercentage: cumulativeBenchmark
                    };
                });
                // --- 主要修正结束 ---

            } else {
                console.log("正在加载近1月数据...");
                return;
            }
            break;
        case '3m':
            // 【修改】调用生成器时，提供一个固定的种子 (例如 12345)
            performanceData = generateRandomPerformanceData(90, 12345); 
            break;
        case '1y':
            // 【修改】为1年数据提供一个不同的固定种子 (例如 54321)
            performanceData = generateRandomPerformanceData(365, 54321); 
            break;
        default:
            return;
    }
    
    // 从数据中提取标签和数据集
    const labels = performanceData.map(item => {
        const date = new Date(item.date);
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });

    // 这里的 item.dailyReturnPercentage 现在已经是累积值了
    const portfolioReturns = performanceData.map(item => item.dailyReturnPercentage);
    const benchmarkReturns = performanceData.map(item => item.benchmarkReturnPercentage);

    // 更新Chart.js实例的数据
    if (returnChart) {
        returnChart.data.labels = labels;
        returnChart.data.datasets[0].data = portfolioReturns;
        returnChart.data.datasets[1].data = benchmarkReturns;
        
        const showPoints = timeframe === '1m';
        returnChart.data.datasets.forEach(dataset => {
            dataset.pointRadius = showPoints ? 3 : 0;
        });

        returnChart.update(); // 重新渲染图表
    }
}

// --- 重大修改 ---
// 初始化时间筛选交互，现在它只负责调用更新函数
function initTimeFilterInteraction() {
    const timeTabs = document.querySelectorAll('.return-container .time-tab');
    timeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 更新UI的 active 状态
            timeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 根据点击的按钮调用图表更新函数
            const timeframeText = this.textContent;
            if (timeframeText === 'Past month') {
                updateReturnChart('1m');
            } else if (timeframeText === 'Past three months') {
                updateReturnChart('3m');
            } else if (timeframeText === 'Past year') {
                updateReturnChart('1y');
            }
        });
    });
}

// --- 新增函数 ---
// 从API获取近30天的业绩数据
async function fetchDailyPerformanceData() {
    try {
        const response = await fetch('http://localhost:3001/api/portfolio/daily-performance');
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        const apiResponse = await response.json();
        
        if (apiResponse.code !== 200 || !apiResponse.data) {
            throw new Error('API返回数据格式错误或状态码非200');
        }

        console.log("成功获取每日业绩数据:", apiResponse.data);
        
        // 将获取到的真实数据存储在全局变量中
        monthlyPerformanceData = apiResponse.data;

        // 数据加载成功后，默认更新一次图表（根据默认选中的tab）
        const activeTab = document.querySelector('.return-container .time-tab.active');
        if (activeTab) {
            const timeframeText = activeTab.textContent;
            if (timeframeText === 'Past month') updateReturnChart('1m');
            else if (timeframeText === 'Past three months') updateReturnChart('3m');
            else if (timeframeText === 'Past year') updateReturnChart('1y');
        } else {
             updateReturnChart('3m'); // 如果没有active的tab，默认显示3个月
        }

    } catch (error) {
        console.error('Fail to fetch the daily performance:', error);
        // 如果API失败，可以依然显示模拟数据
        updateReturnChart('3m');
    }
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
    // initTimeFilterInteraction();
    initRefreshButtons();
    
    // --- 图表初始化 (只执行一次) ---
    initAssetChart(); // 初始化空的资产饼图
    initReturnChart(); // 初始化空的收益率折线图
    initTimeFilterInteraction(); // 初始化点击事件

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
    //fetchAssetAllocationData(); // 【关键】获取资产分布饼图数据
    fetchDailyPerformanceData(); // 【新增】获取每日业绩数据来填充折线图

    
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

     // Global data storage
        const mockStocks = [
            {
                symbol: "AAPL",
                lastSalePrice: "172.50",
                netChange: "-0.82",
                percentageChange: "-0.47",
                volume: 62784000,
                stockType: "Common Stock",
                name: "Apple Inc."
            },
            {
                symbol: "SPY",
                lastSalePrice: "452.78",
                netChange: "+1.25",
                percentageChange: "+0.28",
                volume: 73592000,
                stockType: "ETF",
                name: "S&P 500 ETF"
            },
            {
                symbol: "VFIAX",
                lastSalePrice: "435.67",
                netChange: "-0.35",
                percentageChange: "-0.08",
                volume: 25684000,
                stockType: "Managed Fund",
                name: "Vanguard 500 Index Fund"
            }
        ];

        let userStocks = [...mockStocks];
        
        // Simple interaction logic
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

        // Modal control
        const modal = document.getElementById('add-stock-modal');
        const addBtn = document.getElementById('add-stock-btn');
        const closeBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-modal-btn');
        const form = document.getElementById('add-stock-form');
        const submitBtn = document.getElementById('submit-stock-btn');
        const deleteBtn = document.getElementById('delete-stock-btn');
        const selectAllCheckbox = document.getElementById('select-all');

        addBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        function closeModal() {
            modal.classList.remove('active');
            form.reset();
            document.body.style.overflow = 'auto';
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Prevent form submission default behavior
        form.addEventListener('submit', (e) => e.preventDefault());
        
        // Format volume display
        function formatVolume(volume) {
            if (volume >= 100000000) {
                return (volume / 100000000).toFixed(2) + 'B';
            } else if (volume >= 10000) {
                return (volume / 10000).toFixed(2) + 'K';
            } else {
                return volume;
            }
        }

        // Get stock type name
        function getStockTypeName(type) {
            const typeMap = {
                'Common Stock': 'Common Stock',
                'ETF': 'ETF',
                'Managed Fund': 'Managed Fund',
                'REITs': 'REIT',
                'Preferred Stock': 'Preferred Stock'
            };
            return typeMap[type] || type;
        }

        // Add stock function
        function addStock() {
            const name = document.getElementById('stock-name').value.trim();
            const code = document.getElementById('stock-code').value.trim().toUpperCase();
            const price = parseFloat(document.getElementById('stock-price').value);
            const change = parseFloat(document.getElementById('stock-change').value);
            const type = document.getElementById('stock-type').value;
            
            // Validate data
            if (!name || !code || isNaN(price) || isNaN(change) || !type) {
                alert('Please fill in all stock information');
                return;
            }
            
            // Check if stock already exists
            if (userStocks.some(stock => stock.symbol === code)) {
                alert('This stock is already in your portfolio');
                return;
            }
            
            // Create new stock object
            const newStock = {
                symbol: code,
                name: name,
                lastSalePrice: price.toFixed(2),
                netChange: change.toFixed(2),
                percentageChange: (change / 100).toFixed(2),
                stockType: type,
                volume: Math.floor(Math.random() * 10000000) + 500000
            };
            
            // Add to stock list
            userStocks.push(newStock);
            
            // Update display
            renderStocks();
            
            // Close modal
            closeModal();
            
            // Show success notification
            showNotification(`Stock ${name} (${code}) added successfully!`);
        }

        // Delete single stock
        function deleteStock(symbol) {
            userStocks = userStocks.filter(stock => stock.symbol !== symbol);
            renderStocks();
            showNotification(`Stock ${symbol} deleted`);
        }

        // Delete selected stocks
        function deleteSelectedStocks() {
            const selectedCheckboxes = document.querySelectorAll('.stock-checkbox:checked');
            
            if (selectedCheckboxes.length === 0) {
                alert('Please select stocks to delete');
                return;
            }
            
            const symbolsToDelete = Array.from(selectedCheckboxes).map(checkbox => 
                checkbox.getAttribute('data-symbol')
            );
            
            userStocks = userStocks.filter(stock => 
                !symbolsToDelete.includes(stock.symbol)
            );
            
            renderStocks();
            showNotification(`Deleted ${symbolsToDelete.length} stocks`);
        }

        // Render stock list
        function renderStocks() {
            const tbody = document.getElementById('stock-data');
            const placeholder = document.getElementById('empty-placeholder');
            
            // Show/hide empty state
            if (userStocks.length === 0) {
                placeholder.style.display = 'block';
                tbody.innerHTML = '';
                return;
            }
            
            placeholder.style.display = 'none';
            tbody.innerHTML = '';
            
            userStocks.forEach(stock => {
                const change = parseFloat(stock.netChange);
                const changeClass = change >= 0 ? 'up' : 'down';
                const sign = change >= 0 ? '+' : '';
                const percent = Math.abs(change / parseFloat(stock.lastSalePrice) * 100).toFixed(2);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="stock-checkbox" data-symbol="${stock.symbol}"></td>
                    <td>
                        <div class="stock-info">
                            <div class="stock-name">${stock.name}</div>
                            <div class="stock-code">${stock.symbol}</div>
                        </div>
                    </td>
                    <td>
                        <div class="stock-price">${stock.lastSalePrice}</div>
                    </td>
                    <td>
                        <div class="stock-change ${changeClass}">
                            <div class="change-value">${sign}${Math.abs(change).toFixed(2)}</div>
                            <div class="change-percent">${sign}${percent}%</div>
                        </div>
                    </td>
                    <td>
                        <div class="volume">${formatVolume(stock.volume)}</div>
                    </td>
                    <td>
                        <div class="market-cap">${getStockTypeName(stock.stockType)}</div>
                    </td>
                    <td class="action-cell">
                        <button class="action-btn delete-btn" data-symbol="${stock.symbol}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Add delete button event listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const symbol = this.getAttribute('data-symbol');
                    if (confirm(`Are you sure you want to delete ${symbol}?`)) {
                        deleteStock(symbol);
                    }
                });
            });
            
            // Add checkbox event listeners
            document.querySelectorAll('.stock-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateSelectAllState);
            });
        }
        
        // Update select all checkbox state
        function updateSelectAllState() {
            const checkboxes = document.querySelectorAll('.stock-checkbox');
            const allChecked = checkboxes.length > 0 && 
                Array.from(checkboxes).every(checkbox => checkbox.checked);
            
            selectAllCheckbox.checked = allChecked;
        }
        
        // Select all/deselect all functionality
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.stock-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // Show notification message
        function showNotification(message) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.backgroundColor = '#333';
            toast.style.color = 'white';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '6px';
            toast.style.zIndex = '1000';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }

        // Add submit button listener
        submitBtn.addEventListener('click', addStock);
        
        // Add delete button listener
        deleteBtn.addEventListener('click', deleteSelectedStocks);
        
        // Render stocks on page load
        document.addEventListener('DOMContentLoaded', () => {
            renderStocks();
            
            // Add keyboard event listener
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
        });

// // 新闻数据
//         const newsData = [
//             {
//                 tag: "财经",
//                 title: "上证指数突破3400点大关，创年内新高",
//                 link: "#"
//             },
//             {
//                 tag: "科技",
//                 title: "新一代人工智能芯片发布，性能提升300%",
//                 link: "#"
//             },
//             {
//                 tag: "体育",
//                 title: "中国女排成功晋级世界联赛决赛",
//                 link: "#"
//             },
//             {
//                 tag: "国际",
//                 title: "多国领导人出席全球气候峰会",
//                 link: "#"
//             },
//             {
//                 tag: "娱乐",
//                 title: "《失落的宝藏》首映票房突破10亿",
//                 link: "#"
//             }
//         ];

//         // 初始化滚动条
//         function initNewsTicker() {
//             const tickerContainer = document.getElementById('ticker-content');
//             tickerContainer.innerHTML = ''; // 清空容器
            
//             // 创建新闻项DOM
//             newsData.forEach(item => {
//                 const newsElement = document.createElement('div');
//                 newsElement.className = 'ticker-item';
//                 newsElement.innerHTML = `
//                     <span class="news-tag">${item.tag}</span>
//                     <a href="${item.link}" target="_blank">${item.title}</a>
//                 `;
//                 tickerContainer.appendChild(newsElement);
//             });
            
//             // 克隆内容以创建无缝滚动效果
//             tickerContainer.innerHTML += tickerContainer.innerHTML;
//         }

//         // 页面加载完成后执行初始化
//         window.addEventListener('DOMContentLoaded', initNewsTicker);

// Global data storage
       