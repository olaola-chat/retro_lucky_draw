/**
 * 幸运盲盒抽奖游戏
 * 一个简单的抽奖游戏，让用户直接点击盲盒获得奖品
 */

// 全局变量
let totalParticipants = 0;  // N: 参与人数
let totalBoxes = 0;        // 盲盒总数，自动设置为 2N
let prizeConfigurations = []; // 奖品配置信息
let boxes = [];             // 盲盒数组
let drawnResults = [];      // 抽奖结果
let currentBox = null;      // 当前打开的盒子
let winnersList = [];       // 中奖者记录列表

// DOM 元素
const adminPanel = document.getElementById('admin-panel');
const drawPanel = document.getElementById('draw-panel');
const resultPanel = document.getElementById('result-panel');
const totalParticipantsInput = document.getElementById('total-participants');
const participantCountSpan = document.getElementById('participant-count');
const boxCountSpan = document.getElementById('box-count');
const configurePrizesBtn = document.getElementById('configure-prizes');
const prizeConfigurationDiv = document.getElementById('prize-configuration');
const prizeInputsDiv = document.getElementById('prize-inputs');
const saveConfigurationBtn = document.getElementById('save-configuration');
const startActivityBtn = document.getElementById('start-activity');
const resetActivityBtn = document.getElementById('reset-activity');
const boxesContainer = document.getElementById('boxes-container');
const showResultsBtn = document.getElementById('show-results');
const backToAdminBtn = document.getElementById('back-to-admin');
const backToDrawBtn = document.getElementById('back-to-draw');
const resetFromResultBtn = document.getElementById('reset-from-result');
const resultContainer = document.getElementById('result-container');

// 笔记本元素
const notebookPanel = document.getElementById('notebook-panel');
const winnersList_element = document.getElementById('winners-list');
const winnerNameInput = document.getElementById('winner-name');
const addWinnerBtn = document.getElementById('add-winner-note');
const clearNotebookBtn = document.getElementById('clear-notebook');

// 模态框元素
const modal = document.getElementById('modal');
const closeButton = document.querySelector('.close-button');
const modalBody = document.getElementById('modal-body');

// 事件监听器
window.addEventListener('DOMContentLoaded', init);

// 初始化函数
function init() {
    // 添加事件监听器
    configurePrizesBtn.addEventListener('click', showPrizeConfigurationPanel);
    saveConfigurationBtn.addEventListener('click', savePrizeConfiguration);
    startActivityBtn.addEventListener('click', startActivity);
    resetActivityBtn.addEventListener('click', resetActivity);
    showResultsBtn.addEventListener('click', showResults);
    backToAdminBtn.addEventListener('click', showAdminPanel);
    backToDrawBtn.addEventListener('click', showDrawPanel);
    resetFromResultBtn.addEventListener('click', resetActivity);
    
    // 笔记本事件监听器
    addWinnerBtn.addEventListener('click', addWinnerNote);
    clearNotebookBtn.addEventListener('click', clearNotebook);
    winnerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addWinnerNote();
        }
    });
    
    // 模态框关闭按钮
    closeButton.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // 初始化默认值
    totalParticipants = parseInt(totalParticipantsInput.value);
    totalBoxes = totalParticipants * 2; // 盲盒数为参与人数的两倍
    
    // 监听输入变化
    totalParticipantsInput.addEventListener('change', () => {
        totalParticipants = parseInt(totalParticipantsInput.value);
        totalBoxes = totalParticipants * 2; // 更新盲盒数
    });
    
    // 载入保存的中奖记录
    loadWinnersList();
    renderNotebook();
}

// 显示奖品配置面板
function showPrizeConfigurationPanel() {
    // 获取当前设置的参与人数和计算盲盒数量
    totalParticipants = parseInt(totalParticipantsInput.value);
    if (isNaN(totalParticipants) || totalParticipants <= 0) {
        showModal('错误', '请输入有效的参与人数');
        return;
    }
    
    totalBoxes = totalParticipants * 2; // 盲盒数为参与人数的两倍
    
    // 清空之前的输入
    prizeInputsDiv.innerHTML = '';
    
    // 创建默认的奖品配置
    let defaultConfig = [];
    
    // 如果已有奖品配置，则使用
    if (prizeConfigurations && Array.isArray(prizeConfigurations) && prizeConfigurations.length > 0) {
        defaultConfig = JSON.parse(JSON.stringify(prizeConfigurations)); // 深拷贝避免引用问题
        console.log("载入现有奖品配置:", defaultConfig);
        
        // 添加提示信息
        const configInfo = document.createElement('div');
        configInfo.className = 'config-info';
        configInfo.innerHTML = `
            <p>已载入现有配置 (${prizeConfigurations.length} 种奖品)。</p>
            <p>您可以修改现有奖品或添加/删除奖品，总数必须等于参与人数 ${totalParticipants}。</p>
        `;
        prizeInputsDiv.appendChild(configInfo);
    } else {
        // 创建默认配置：一等奖1个，二等奖2个，参与奖其余
        // 注意：总奖品数量应该等于参与人数，而不是盲盒数量
        if (totalParticipants >= 3) {
            defaultConfig = [
                { name: '一等奖', count: 1 },
                { name: '二等奖', count: 2 },
                { name: '参与奖', count: totalParticipants - 3 }
            ];
        } else if (totalParticipants === 2) {
            defaultConfig = [
                { name: '一等奖', count: 1 },
                { name: '二等奖', count: 1 }
            ];
        } else {
            defaultConfig = [
                { name: '一等奖', count: 1 }
            ];
        }
        console.log("使用默认奖品配置模板:", defaultConfig);
        
        // 添加提示信息
        const configInfo = document.createElement('div');
        configInfo.className = 'config-info';
        configInfo.innerHTML = `
            <p>已创建默认配置模板，您可以根据需要修改。</p>
            <p>总奖品数量必须等于参与人数 ${totalParticipants}。</p>
        `;
        prizeInputsDiv.appendChild(configInfo);
    }
    
    // 创建奖品输入表单
    defaultConfig.forEach((prize, index) => {
        const group = document.createElement('div');
        group.className = 'prize-input-group';
        group.dataset.index = index;
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = '奖品名称';
        nameInput.value = prize.name;
        nameInput.id = `prize-name-${index}`;
        nameInput.className = 'prize-name-input';
        
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.placeholder = '数量';
        countInput.value = prize.count;
        countInput.min = 1;
        countInput.id = `prize-count-${index}`;
        countInput.className = 'prize-count-input';
        
        const removeButton = document.createElement('button');
        removeButton.innerText = '删除';
        removeButton.className = 'btn';
        removeButton.onclick = () => {
            group.remove();
            console.log("已删除奖品输入组:", index);
            updateTotalCount(); // 更新总数显示
        };
        
        group.appendChild(nameInput);
        group.appendChild(countInput);
        group.appendChild(removeButton);
        
        prizeInputsDiv.appendChild(group);
        console.log(`已创建奖品输入组 #${index}:`, prize.name, prize.count);
    });
    
    // 添加当前总数计数器
    const countDisplay = document.createElement('div');
    countDisplay.id = 'prize-count-display';
    countDisplay.className = 'prize-count-display';
    updateTotalCount(); // 初始化总数显示
    prizeInputsDiv.appendChild(countDisplay);
    
    // 添加"添加奖品"按钮
    const addButton = document.createElement('button');
    addButton.innerText = '添加奖品';
    addButton.className = 'btn secondary-btn';
    addButton.onclick = () => {
        addPrizeInput();
        updateTotalCount(); // 更新总数显示
    };
    prizeInputsDiv.appendChild(addButton);
    
    // 显示配置面板
    prizeConfigurationDiv.style.display = 'block';
    
    // 更新总数显示的函数
    function updateTotalCount() {
        let total = 0;
        const inputs = document.querySelectorAll('.prize-input-group input[type="number"]');
        inputs.forEach(input => {
            const count = parseInt(input.value) || 0;
            total += count;
        });
        
        const countDisplay = document.getElementById('prize-count-display');
        if (countDisplay) {
            const isValid = total === totalParticipants;
            countDisplay.innerHTML = `
                <p>当前奖品总数: <span class="${isValid ? 'count-valid' : 'count-invalid'}">${total}</span> / ${totalParticipants} ${isValid ? '✓' : '✗'}</p>
            `;
        }
    }
    
    // 为所有数量输入框添加事件监听
    document.querySelectorAll('.prize-input-group input[type="number"]').forEach(input => {
        input.addEventListener('change', updateTotalCount);
        input.addEventListener('input', updateTotalCount);
    });
}

// 添加奖品输入行
function addPrizeInput() {
    const index = document.querySelectorAll('.prize-input-group').length;
    console.log("添加新奖品输入，当前索引:", index);
    
    const group = document.createElement('div');
    group.className = 'prize-input-group';
    group.dataset.index = index; // 添加索引属性到DOM元素
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '奖品名称';
    nameInput.id = `prize-name-${index}`;
    nameInput.className = 'prize-name-input';
    
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.placeholder = '数量';
    countInput.min = 1;
    countInput.value = 1;
    countInput.id = `prize-count-${index}`;
    countInput.className = 'prize-count-input';
    
    // 添加数量变化事件
    countInput.addEventListener('change', updateTotalPrizeCount);
    countInput.addEventListener('input', updateTotalPrizeCount);
    
    const removeButton = document.createElement('button');
    removeButton.innerText = '删除';
    removeButton.className = 'btn';
    removeButton.onclick = () => {
        group.remove();
        console.log("已删除奖品输入组:", index);
        updateTotalPrizeCount(); // 删除后更新总数
    };
    
    group.appendChild(nameInput);
    group.appendChild(countInput);
    group.appendChild(removeButton);
    
    // 添加到倒数第二个元素之前（最后一个是"添加奖品"按钮）
    // 如果有总数显示，添加到总数显示前面
    const countDisplay = document.getElementById('prize-count-display');
    if (countDisplay) {
        prizeInputsDiv.insertBefore(group, countDisplay);
    } else {
        prizeInputsDiv.insertBefore(group, prizeInputsDiv.lastChild);
    }
    
    console.log("已添加新奖品输入组:", index);
}

// 更新奖品总数显示
function updateTotalPrizeCount() {
    let total = 0;
    const inputs = document.querySelectorAll('.prize-input-group input[type="number"]');
    inputs.forEach(input => {
        const count = parseInt(input.value) || 0;
        total += count;
    });
    
    const countDisplay = document.getElementById('prize-count-display');
    if (countDisplay) {
        const isValid = total === totalParticipants;
        countDisplay.innerHTML = `
            <p>当前奖品总数: <span class="${isValid ? 'count-valid' : 'count-invalid'}">${total}</span> / ${totalParticipants} ${isValid ? '✓' : '✗'}</p>
        `;
    }
}

// 保存奖品配置
function savePrizeConfiguration() {
    // 获取所有奖品输入组
    const prizeGroups = document.querySelectorAll('.prize-input-group');
    console.log("检测到奖品输入组数量:", prizeGroups.length);
    
    // 清空之前的配置，确保完全使用新配置
    const newConfigurations = [];
    let totalCount = 0;
    
    // 收集所有奖品配置
    for (let index = 0; index < prizeGroups.length; index++) {
        const group = prizeGroups[index];
        // 直接从每个组中获取输入元素
        const nameInput = group.querySelector('input[type="text"]');
        const countInput = group.querySelector('input[type="number"]');
        
        if (nameInput && countInput) {
            const name = nameInput.value.trim();
            const count = parseInt(countInput.value);
            
            console.log(`处理奖品 #${index+1}:`, name, count);
            
            if (name && !isNaN(count) && count > 0) {
                newConfigurations.push({ name, count });
                totalCount += count;
                console.log(`已添加奖品: ${name}, 数量: ${count}, 当前总数: ${totalCount}`);
            } else {
                console.warn(`奖品 #${index+1} 数据无效: 名称=${name}, 数量=${count}`);
            }
        } else {
            console.error(`无法找到奖品 #${index+1} 的输入元素:`, 
                nameInput ? "名称输入框存在" : "名称输入框缺失", 
                countInput ? "数量输入框存在" : "数量输入框缺失");
        }
    }
    
    // 验证奖品总数，如果不足则用"未中奖"填补
    if (totalCount > totalParticipants) {
        showModal('错误', `奖品总数不能超过参与人数 ${totalParticipants}，当前总数为 ${totalCount}`);
        console.error(`奖品总数 (${totalCount}) 超过了参与人数 (${totalParticipants})`);
        return;
    }

    if (totalCount < totalParticipants) {
        const diff = totalParticipants - totalCount;
        const notWonPrize = newConfigurations.find(p => p.name === '未中奖');
        if (notWonPrize) {
            notWonPrize.count += diff;
        } else {
            newConfigurations.push({ name: '未中奖', count: diff });
        }
        totalCount += diff;
        console.log(`奖品数量不足，已自动添加 ${diff} 个"未中奖"`);
    }

    // 验证是否有配置 (如果参与人数 > 0，此时配置不应为空)
    if (newConfigurations.length === 0 && totalParticipants > 0) {
        showModal('错误', '至少需要配置一种奖品');
        console.error('没有有效的奖品配置');
        return;
    }
    
    // 完全替换之前的配置，确保旧的配置不会保留
    prizeConfigurations = [...newConfigurations];
    console.log("已保存新的奖品配置:", prizeConfigurations);
    prizeConfigurationDiv.style.display = 'none';
    
    // 显示成功消息
    showModal('成功', `已保存 ${prizeConfigurations.length} 种奖品配置，总数量: ${totalCount}`);
}

// 开始抽奖活动
function startActivity() {
    // 获取参与人数
    totalParticipants = parseInt(totalParticipantsInput.value);
    
    // 验证输入
    if (isNaN(totalParticipants) || totalParticipants <= 0) {
        showModal('错误', '请输入有效的参与人数');
        return;
    }
    
    // 计算盲盒数量
    totalBoxes = totalParticipants * 2;
    
    // 检查奖品配置是否有效 - 这里我们只检查基本结构，不校验内容
    let isConfigValid = prizeConfigurations && Array.isArray(prizeConfigurations) && prizeConfigurations.length > 0;
    
    console.log("检查用户配置的奖品:", prizeConfigurations);
    
    // 验证奖品总数是否等于参与人数 - 但不应该直接覆盖用户的选择
    if (isConfigValid) {
        let totalPrizes = 0;
        prizeConfigurations.forEach(config => {
            if (config && config.count) {
                totalPrizes += config.count;
            }
        });
        
        console.log("验证奖品总数:", totalPrizes, "参与人数:", totalParticipants);
        
        // 如果奖品总数不等于参与人数，则显示错误并停止
        if (totalPrizes !== totalParticipants) {
            showModal('配置错误', `奖品总数 (${totalPrizes}) 与参与人数 (${totalParticipants}) 不匹配，请返回修改配置。`);
            console.error(`奖品总数与参与人数不匹配，已停止活动开始`);
            return; // 终止函数执行
        }
    }
    
    // 如果没有有效的奖品配置，使用默认配置
    if (!isConfigValid) {
        console.warn("无有效奖品配置，使用默认配置");
        // 简单模式：根据参与人数分配默认奖项
        if (totalParticipants >= 3) {
            prizeConfigurations = [
                { name: '一等奖', count: 1 },
                { name: '二等奖', count: 2 },
                { name: '参与奖', count: totalParticipants - 3 }
            ];
        } else if (totalParticipants === 2) {
            prizeConfigurations = [
                { name: '一等奖', count: 1 },
                { name: '二等奖', count: 1 }
            ];
        } else {
            prizeConfigurations = [
                { name: '一等奖', count: 1 }
            ];
        }
        
        // 确保默认配置的总数也等于参与人数
        let defaultTotal = 0;
        prizeConfigurations.forEach(p => defaultTotal += p.count);
        if (defaultTotal !== totalParticipants) {
            console.error("默认配置与参与人数不匹配，这是一个逻辑错误");
            // 这种情况下，可能需要更复杂的处理，或者直接报错
            // 为简单起见，我们这里假设默认配置逻辑总是正确的
        }
    }
    
    console.log("最终使用的奖品配置:", prizeConfigurations);
    
    // 创建盲盒数组
    boxes = createBoxes();
    
    // 清空抽奖结果
    drawnResults = [];
    
    // 更新显示的参与人数和盲盒数量
    participantCountSpan.textContent = totalParticipants;
    boxCountSpan.textContent = totalBoxes;
    
    // 切换到抽奖面板
    adminPanel.style.display = 'none';
    drawPanel.style.display = 'block';
    resultPanel.style.display = 'none';
    
    // 渲染盲盒
    renderBoxes();
}

// 创建盲盒数组
function createBoxes() {
    const boxesArray = [];
    
    // 1. 先创建所有盲盒，初始都是空的
    for (let i = 1; i <= totalBoxes; i++) {
        boxesArray.push({
            id: i,
            prize: null,
            drawn: false
        });
    }
    
    // 2. 确保奖品配置有效
    if (!prizeConfigurations || !Array.isArray(prizeConfigurations) || prizeConfigurations.length === 0) {
        console.error("奖品配置无效，无法创建盲盒:", prizeConfigurations);
        // 为所有盲盒设置默认值以避免空值
        boxesArray.forEach(box => {
            box.prize = "未中奖";
        });
        return boxesArray;
    }
    
    // 3. 严格按照配置创建奖品数组
    const prizes = [];
    let configValid = true;
    
    prizeConfigurations.forEach(config => {
        if (!config || !config.name || !config.count || config.count <= 0) {
            console.error("检测到无效的奖品配置:", config);
            configValid = false;
            return;
        }
        
        for (let i = 0; i < config.count; i++) {
            prizes.push(config.name);
        }
    });
    
    // 如果配置无效，提前返回
    if (!configValid) {
        console.error("奖品配置包含无效项，无法继续");
        boxesArray.forEach(box => {
            box.prize = "未中奖";
        });
        return boxesArray;
    }
    
    // 确保奖品数量等于参与人数
    if (prizes.length !== totalParticipants) {
        console.error("奖品数量与参与人数不一致!", prizes.length, totalParticipants);
        boxesArray.forEach(box => {
            box.prize = "未中奖";
        });
        return boxesArray;
    }
    
    console.log("创建的奖品数组:", prizes);
    
    // 4. 随机选择盲盒位置放入奖品 - 确保每个位置唯一
    const boxPositions = getRandomPositions(totalBoxes, totalParticipants);
    console.log("随机生成的位置:", boxPositions);
    
    // 5. 将奖品放入选出的位置
    boxPositions.forEach((position, index) => {
        if (position >= 0 && position < boxesArray.length && index < prizes.length) {
            boxesArray[position].prize = prizes[index];
        } else {
            console.error(`无效的位置或奖品索引: 位置=${position}, 奖品索引=${index}`);
        }
    });
    
    // 6. 为其余盲盒设置"未中奖"
    boxesArray.forEach(box => {
        if (box.prize === null) {
            box.prize = "未中奖";
        }
    });
    
    // 7. 验证奖品分布是否符合配置
    validatePrizeDistribution(boxesArray);
    
    return boxesArray;
}

// 验证奖品分布是否符合配置
function validatePrizeDistribution(boxesArray) {
    const distribution = {};
    
    // 统计每种奖品的数量
    boxesArray.forEach(box => {
        if (box.prize !== "未中奖") {
            if (!distribution[box.prize]) {
                distribution[box.prize] = 0;
            }
            distribution[box.prize]++;
        }
    });
    
    console.log("奖品分布统计:", distribution);
    
    // 检查是否与配置一致
    let isValid = true;
    prizeConfigurations.forEach(config => {
        if (distribution[config.name] !== config.count) {
            console.error(`奖品 "${config.name}" 的数量不符合配置: 预期 ${config.count}, 实际 ${distribution[config.name] || 0}`);
            isValid = false;
        }
    });
    
    if (!isValid) {
        console.error("奖品分布与配置不一致，可能出现错误!");
    } else {
        console.log("奖品分布验证通过，严格按照配置完成分配!");
    }
}

// 获取随机不重复位置
function getRandomPositions(max, count) {
    const positions = [];
    while (positions.length < count) {
        const pos = Math.floor(Math.random() * max);
        if (!positions.includes(pos)) {
            positions.push(pos);
        }
    }
    return positions;
}

// 渲染盲盒
function renderBoxes() {
    // 清空容器
    boxesContainer.innerHTML = '';
    
    // 创建按照数字顺序排列的盲盒元素
    // 先排序盲盒，按ID从小到大
    const sortedBoxes = [...boxes].sort((a, b) => a.id - b.id);
    
    // 确保所有盲盒都有有效的奖品值
    sortedBoxes.forEach(box => {
        if (!box.prize) {
            console.warn(`盲盒 #${box.id} 没有奖品值，设为未中奖`);
            box.prize = "未中奖";
        }
    });
    
    // 然后创建元素
    sortedBoxes.forEach(box => {
        const boxElement = document.createElement('div');
        boxElement.className = box.drawn ? 'box opened' : 'box';
        boxElement.dataset.id = box.id;
        
        // 添加盒子编号
        const numberElement = document.createElement('div');
        numberElement.className = 'box-number';
        numberElement.textContent = box.id;
        
        // 盲盒正面
        const front = document.createElement('div');
        front.className = 'box-front';
        front.innerHTML = '?';
        
        // 盲盒背面（奖品，初始隐藏）
        const back = document.createElement('div');
        back.className = 'box-back';
        
        // 确保显示的奖品文本不为空
        const prizeText = box.prize || "未中奖";
        
        // 根据是否中奖显示不同样式
        if (prizeText === "未中奖") {
            back.innerHTML = `<div class="prize-name no-prize">未中奖</div>`;
        } else {
            back.innerHTML = `<div class="prize-name prize-win">${prizeText}</div>`;
        }
        
        boxElement.appendChild(numberElement);
        boxElement.appendChild(front);
        boxElement.appendChild(back);
        
        // 如果盲盒已被抽取，显示奖品标签
        if (box.drawn) {
            const prizeTag = document.createElement('div');
            prizeTag.className = prizeText === "未中奖" ? 'prize-tag no-prize-tag' : 'prize-tag';
            prizeTag.textContent = prizeText;
            boxElement.appendChild(prizeTag);
            boxElement.classList.add('disabled');
        }
        
        // 如果盲盒未被抽取，添加点击事件
        if (!box.drawn) {
            boxElement.addEventListener('click', () => openBox(box.id));
        }
        
        boxesContainer.appendChild(boxElement);
    });
}

// 随机打乱数组
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 打开盲盒
function openBox(boxId) {
    // 查找被选中的盲盒
    const boxIndex = boxes.findIndex(box => box.id === boxId);
    if (boxIndex === -1 || boxes[boxIndex].drawn) {
        return; // 盒子不存在或已被抽取
    }
    
    const box = boxes[boxIndex];
    console.log("打开盲盒:", box);
    
    // 确保盲盒有有效的奖品值
    if (!box.prize) {
        console.warn(`盲盒 #${box.id} 没有奖品值，设为未中奖`);
        box.prize = "未中奖";
    }
    
    // 标记为已抽取
    box.drawn = true;
    
    // 记录当前打开的盒子（用于添加中奖者姓名）
    currentBox = box;
    
    // 记录抽奖结果
    drawnResults.push({
        boxId: box.id,
        prize: box.prize,
        timestamp: new Date().toLocaleString()
    });
    
    // 获取DOM中的盒子元素
    const boxElement = document.querySelector(`.box[data-id="${boxId}"]`);
    if (boxElement) {
        boxElement.classList.add('opened');
        boxElement.classList.add('disabled');
        
        // 添加奖品标签
        const prizeTag = document.createElement('div');
        prizeTag.className = box.prize === "未中奖" ? 'prize-tag no-prize-tag' : 'prize-tag';
        prizeTag.textContent = box.prize;
        boxElement.appendChild(prizeTag);
        
        // 移除点击事件
        const newBox = boxElement.cloneNode(true);
        boxElement.parentNode.replaceChild(newBox, boxElement);
    }
    
    // 显示抽奖结果
    showDrawResult(box);
    
    // 清空姓名输入框，为新的中奖者准备
    winnerNameInput.value = '';
    
    // 如果不是未中奖，聚焦到姓名输入框
    if (box.prize !== "未中奖") {
        winnerNameInput.focus();
        // 滚动到笔记本
        notebookPanel.scrollIntoView({ behavior: "smooth" });
    }
}

// 显示抽奖结果
function showDrawResult(box) {
    let title, message, className;
    
    // 确保prize值有效
    const prizeText = box.prize || "未中奖";
    
    if (prizeText === "未中奖") {
        title = "很遗憾";
        message = "这个盲盒中没有奖品";
        className = "no-prize-result";
    } else {
        title = "恭喜!";
        message = `获得了 ${prizeText}`;
        className = "prize-result";
        
        // 添加姓名输入提示
        const namePrompt = document.createElement('p');
        namePrompt.className = 'name-prompt';
        namePrompt.textContent = '请在右侧笔记本中记录中奖者姓名';
        modalBody.appendChild(namePrompt);
    }
    
    const content = `
        <h3>${title}</h3>
        <p>盲盒 #${box.id} ${message}</p>
        <div class="${className}">
            <span class="prize-name">${prizeText}</span>
        </div>
    `;
    
    modalBody.innerHTML = content;
    
    // 如果中奖，添加录入姓名提示
    if (prizeText !== "未中奖") {
        const namePrompt = document.createElement('p');
        namePrompt.className = 'name-prompt';
        namePrompt.textContent = '请在右侧笔记本中记录中奖者姓名';
        modalBody.appendChild(namePrompt);
    }
    
    modal.style.display = 'block';
}

// 显示抽奖结果面板
function showResults() {
    // 准备结果数据
    const prizeSummary = {};
    
    // 统计各奖项的获奖情况
    drawnResults.forEach(result => {
        // 确保奖品值有效
        const prizeText = result.prize || "未中奖";
        
        if (!prizeSummary[prizeText]) {
            prizeSummary[prizeText] = [];
        }
        prizeSummary[prizeText].push(result.boxId);
    });
    
    // 生成结果HTML
    let resultHTML = `<h3>抽奖统计结果</h3>`;
    
    // 添加参与信息
    const openedCount = drawnResults.length;
    resultHTML += `<p>参与人数: ${totalParticipants}, 盲盒总数: ${totalBoxes}, 已开启: ${openedCount}, 未开启: ${totalBoxes - openedCount}</p>`;
    
    // 首先添加中奖结果（排除"未中奖"）
    let hasPrizes = false;
    for (const prize in prizeSummary) {
        if (prize !== "未中奖" && prize !== "null" && prize !== "undefined") {
            hasPrizes = true;
            resultHTML += `
                <div class="result-item">
                    <span class="prize-level">${prize}</span>
                    <span class="prize-winners">
                        盲盒编号: ${prizeSummary[prize].join(', ')}
                        <span class="prize-count">${prizeSummary[prize].length}个</span>
                    </span>
                </div>
            `;
        }
    }
    
    // 添加未中奖结果
    if (prizeSummary["未中奖"] && prizeSummary["未中奖"].length > 0) {
        resultHTML += `
            <div class="result-item no-prize-item">
                <span class="prize-level">未中奖</span>
                <span class="prize-winners">
                    盲盒编号: ${prizeSummary["未中奖"].join(', ')}
                    <span class="prize-count">${prizeSummary["未中奖"].length}个</span>
                </span>
            </div>
        `;
    }
    
    // 合并任何无效奖品结果到未中奖类别
    const invalidPrizes = ["null", "undefined"];
    let invalidBoxes = [];
    
    invalidPrizes.forEach(invalid => {
        if (prizeSummary[invalid] && prizeSummary[invalid].length > 0) {
            invalidBoxes = invalidBoxes.concat(prizeSummary[invalid]);
        }
    });
    
    if (invalidBoxes.length > 0) {
        resultHTML += `
            <div class="result-item no-prize-item">
                <span class="prize-level">无效奖品</span>
                <span class="prize-winners">
                    盲盒编号: ${invalidBoxes.join(', ')}
                    <span class="prize-count">${invalidBoxes.length}个</span>
                </span>
            </div>
        `;
    }
    
    // 显示未开启的盒子
    const openedBoxIds = drawnResults.map(result => result.boxId);
    const unopenedBoxIds = boxes
        .filter(box => !openedBoxIds.includes(box.id))
        .map(box => box.id)
        .sort((a, b) => a - b);
    
    if (unopenedBoxIds.length > 0) {
        resultHTML += `
            <div class="result-item unopened-item">
                <span class="prize-level">未开启盲盒</span>
                <span class="prize-winners">
                    盲盒编号: ${unopenedBoxIds.join(', ')}
                    <span class="prize-count">${unopenedBoxIds.length}个</span>
                </span>
            </div>
        `;
    }
    
    // 更新结果容器
    resultContainer.innerHTML = resultHTML;
    
    // 切换到结果面板
    drawPanel.style.display = 'none';
    resultPanel.style.display = 'block';
}

// 返回抽奖面板
function showDrawPanel() {
    drawPanel.style.display = 'block';
    resultPanel.style.display = 'none';
}

// 返回管理员面板
function showAdminPanel() {
    adminPanel.style.display = 'block';
    drawPanel.style.display = 'none';
    resultPanel.style.display = 'none';
}

// 重置活动
function resetActivity() {
    // 重置状态
    boxes = [];
    drawnResults = [];
    currentBox = null;
    
    // 清空奖品配置，确保下次活动是全新的
    prizeConfigurations = [];
    
    // 显示管理员面板
    showAdminPanel();
}

// 显示模态框
function showModal(title, message) {
    const content = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    
    modalBody.innerHTML = content;
    modal.style.display = 'block';
}

// 添加中奖者记录
function addWinnerNote() {
    const name = winnerNameInput.value.trim();
    
    // 如果没有输入姓名或没有当前盒子，直接返回
    if (!name || !currentBox) {
        // 如果没有当前盒子但有姓名
        if (name) {
            showModal('提示', '请先打开一个盲盒');
        }
        return;
    }
    
    // 只记录中奖的情况
    if (currentBox.prize !== "未中奖") {
        const winnerEntry = {
            boxId: currentBox.id,
            prize: currentBox.prize,
            name: name,
            timestamp: new Date().toLocaleString()
        };
        
        // 添加到列表
        winnersList.push(winnerEntry);
        
        // 保存到本地存储
        saveWinnersList();
        
        // 更新笔记本显示
        renderNotebook();
        
        // 清空输入框
        winnerNameInput.value = '';
        
        console.log("已添加中奖记录:", winnerEntry);
    } else {
        showModal('提示', '未中奖盲盒无需记录姓名');
    }
    
    // 清除当前盒子，避免重复添加
    currentBox = null;
}

// 渲染笔记本
function renderNotebook() {
    // 清空笔记本内容
    winnersList_element.innerHTML = '';
    
    // 如果没有中奖记录，显示占位符
    if (winnersList.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'notebook-placeholder';
        placeholder.innerHTML = `
            <p>暂无中奖记录</p>
            <p>打开盲盒后中奖信息将记录在这里</p>
        `;
        winnersList_element.appendChild(placeholder);
        return;
    }
    
    // 渲染所有记录
    winnersList.forEach((winner, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'notebook-entry';
        
        // 创建奖品信息元素
        const prizeElement = document.createElement('span');
        prizeElement.className = 'winner-prize';
        prizeElement.textContent = `[${winner.prize}]`;
        
        // 创建姓名元素
        const nameElement = document.createElement('span');
        nameElement.className = 'winner-name';
        nameElement.textContent = winner.name;
        
        // 创建时间元素
        const timeElement = document.createElement('span');
        timeElement.className = 'winner-time';
        timeElement.textContent = winner.timestamp.split(' ')[1]; // 只显示时间部分
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = '删除此记录';
        deleteBtn.onclick = () => {
            winnersList.splice(index, 1);
            saveWinnersList();
            renderNotebook();
        };
        
        // 将元素添加到条目中
        entryElement.appendChild(prizeElement);
        entryElement.appendChild(nameElement);
        entryElement.appendChild(timeElement);
        entryElement.appendChild(deleteBtn);
        
        // 将条目添加到笔记本
        winnersList_element.appendChild(entryElement);
    });
}

// 清空笔记本
function clearNotebook() {
    // 询问确认
    if (confirm('确定要清空所有中奖记录吗？')) {
        winnersList = [];
        saveWinnersList();
        renderNotebook();
        showModal('提示', '已清空所有中奖记录');
    }
}

// 保存中奖记录到本地存储
function saveWinnersList() {
    try {
        localStorage.setItem('lucky-draw-winners', JSON.stringify(winnersList));
    } catch (e) {
        console.error('保存中奖记录失败:', e);
    }
}

// 从本地存储加载中奖记录
function loadWinnersList() {
    try {
        const savedWinners = localStorage.getItem('lucky-draw-winners');
        if (savedWinners) {
            winnersList = JSON.parse(savedWinners);
            console.log('已加载中奖记录:', winnersList.length, '条');
        }
    } catch (e) {
        console.error('加载中奖记录失败:', e);
        winnersList = [];
    }
}