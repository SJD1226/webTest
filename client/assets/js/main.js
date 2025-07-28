// 全局变量声明
let assetChart, returnChart;

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
            totalReturnPercent.style.color = "#f1403d";
            returnChange.textContent = "优于大盘";
            returnChange.style.color = "#f1403d";
            returnChange.className = "growth-indicator growth-up";
        } else {
            totalReturnPercent.style.color = "#0dbd70";
            returnChange.textContent = "低于大盘";
            returnChange.style.color = "#0dbd70";
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
// 更新收益
function updateTotalProfit(data) {
    try {
        const totalProfit = document.getElementById('total-profit');
    
        if (!totalProfit) {
            throw new Error("未找到收益率显示元素");
        }
        
        // 检查totalReturnPercent字段是否存在
        if (typeof data.totalProfit === 'undefined') {
            throw new Error("API返回数据中缺少totalProfit字段");
        }
        
        // 转换为数字
        const returnValue = Number(data.totalProfit);
        
        if (isNaN(returnValue)) {
            throw new Error(`totalProfit不是有效数字: ${data.totalProfit}`);
        }
        
        // 格式化并显示
        totalProfit.textContent = `${returnValue.toFixed(2)}%`;
   
        
    } catch (error) {
        console.error("更新收益时出错:", error);
        const totalReturnPercent = document.getElementById('total-profit');
        if (totalReturnPercent) {
            totalReturnPercent.textContent = "数据异常";
            totalReturnPercent.style.color = "red";
        }
    }
}


// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化交互功能
    initMenuInteraction();
    initUserAvatarInteraction();
    initTimeFilterInteraction();
    initRefreshButtons();
    
    // 初始化图表
    initAssetChart();
    initReturnChart();
    
    // 首次获取数据
    fetchAssetData();
    
    // 每30秒更新一次数据
    setInterval(fetchAssetData, 30000);
});