function initModule1() {
  console.log("Asset Allocation模块初始化");
}

function initModule2() {
  console.log("Watchlist模块初始化");
}

function initModule3() {
  console.log("模块3初始化");
}

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });

      const moduleFunctions = {
        AssetAllocation: initModule1,
        Watchlist: initModule2,
        module3: initModule3
      };

      if (moduleFunctions[targetId]) {
        moduleFunctions[targetId]();
      }
    }
  });
});
