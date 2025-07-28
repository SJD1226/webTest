// 页面加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 菜单项交互
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有活动类
            menuItems.forEach(i => i.classList.remove('active'));
            // 添加活动类到当前元素
            this.classList.add('active');
        });
    });

    // 用户头像交互
    const userAvatar = document.querySelector('.user-avatar');
    if(userAvatar) {
        userAvatar.addEventListener('click', function() {
            const userName = prompt('请输入您的姓名:', '');
            if(userName && userName.trim()) {
                const initials = userName.trim().substring(0, 2).toUpperCase();
                this.textContent = initials;
            }
        });
    }

    // 初始化饼图（资产分布）
    const assetCtx = document.getElementById('assetChart').getContext('2d');
    const assetChart = new Chart(assetCtx, {
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

    // 初始化折线图（收益率走势对比）
    const returnCtx = document.getElementById('returnChart').getContext('2d');
    const returnChart = new Chart(returnCtx, {
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

    // 时间筛选交互
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
});