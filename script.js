let actorsData = {};
// 声明一个变量 actorsData，初始化为空对象，用于存储从 JSON 文件中加载的演员数据

// 从外部文件加载演员数据
async function loadActorsData() {
    // 定义一个异步函数 loadActorsData，用于从API加载演员数据
    try {
        // 尝试执行以下代码
        // 获取所有演员列表
        const response = await fetch('http://localhost:5000/actors');
        if (!response.ok) {
            throw new Error(`API请求失败，状态码: ${response.status}`);
        }
        const data = await response.json();
        
        // 新API直接返回数组，转换为以name为key的对象
        actorsData = data.reduce((acc, actor) => {
            if (actor.name) {
                acc[actor.name] = actor;
            }
            return acc;
        }, {});
        
        // 检查API返回数据结构是否符合预期
        if (!actorsData || typeof actorsData !== 'object') {
            throw new Error('API返回数据格式不正确');
        }
    } catch (error) {
        // 捕获 try 块中抛出的错误
        console.error('从API加载演员数据时出错:', error);
        // 在控制台输出错误信息
        actorsData = {};
        // 将 actorsData 重置为空对象
        
        // 显示错误信息给用户
        const display = document.getElementById("actors-display");
        if (display) {
        let errorMsg = '加载数据失败: ';
        if (error.message.includes('Failed to fetch')) {
            errorMsg += '无法连接到API服务，请确保API服务已启动并运行在http://localhost:5000';
        } else {
            errorMsg += error.message;
        }
        display.innerHTML = `<p class="error">${errorMsg}</p>`;
        }
    }
}

async function showActors(actorName) {
    // 定义一个异步函数 showActors，用于显示指定演员的信息
    const actorsDisplay = document.getElementById("actors-display");
    // 通过 id 获取页面上用于显示演员信息的 div 元素

    try {
        const response = await fetch(`http://localhost:5000/actors/${encodeURIComponent(actorName)}`);
        if (!response.ok) {
            throw new Error(`获取演员信息失败，状态码: ${response.status}`);
        }
        const actor = await response.json();

    if (actor) {
        // 检查是否找到该演员的信息
        let actorHtml = `<h2>${actorName} 的属性</h2><ul>`;
        // 初始化一个字符串变量 actorHtml，包含演员姓名的二级标题和无序列表的开始标签
        
        // 显示主要属性
        if (actor.health) actorHtml += `<li>生命值: ${actor.health}</li>`;
        if (actor.attack) actorHtml += `<li>攻击力: ${actor.attack}</li>`;
        if (actor.defense) actorHtml += `<li>防御力: ${actor.defense}</li>`;
        
        // 显示其他属性
        for (const property in actor) {
            if (!['name', 'id', 'health', 'attack', 'defense'].includes(property)) {
                actorHtml += `<li>${property}: ${actor[property]}</li>`;
            }
        }
        
        actorHtml += "</ul>";
        // 添加无序列表的结束标签
        actorsDisplay.innerHTML = actorHtml;
        // 将生成的 HTML 内容插入到 actorsDisplay 元素中
    } else {
        actorsDisplay.innerHTML = "<p>未找到相关数据。</p>";
        // 如果未找到该演员的信息，显示提示信息
    }
    } catch (error) {
        console.error('获取演员信息时出错:', error);
        actorsDisplay.innerHTML = `<p class="error">获取演员信息失败: ${error.message}</p>`;
    }
}

// 获取URL参数
function getURLParameter(name) {
    // 定义一个函数 getURLParameter，用于获取 URL 中的指定参数
    return decodeURIComponent((new RegExp('[?|&]' + name + '=([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    // 使用正则表达式匹配 URL 中的指定参数，解码后返回参数值，如果未找到则返回 null
}

// 初始化主页角色列表
async function initActorList() {
    await loadActorsData();
    const actorList = document.getElementById("actor-list");
    if (!actorList) return;
    
    actorList.innerHTML = '';
    
    if (Array.isArray(actorsData)) {
        actorsData.forEach(actor => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `actors.html?actor=${encodeURIComponent(actor.name)}`;
            link.className = 'actor-link';
            link.textContent = actor.name;
            li.appendChild(link);
            actorList.appendChild(li);
        });
    } else {
        for (const name in actorsData) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `actors.html?actor=${encodeURIComponent(name)}`;
            link.className = 'actor-link';
            link.textContent = name;
            li.appendChild(link);
            actorList.appendChild(li);
        }
    }
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', async function() {
    if (location.pathname.endsWith('actors.html')) {
        await loadActorsData();
        const actorName = decodeURIComponent(getURLParameter('actor') || '');
        if (actorName) {
            await showActors(actorName);
        } else {
            document.getElementById("actors-display").innerHTML = "<p>未找到相关数据。</p>";
        }
    } else if (location.pathname.endsWith('index.html') || location.pathname === '/') {
        await initActorList();
    }
});
