// 初始化照片轮播
const swiper = new Swiper('.swiper', {
    loop: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
});

// 添加智谱AI接口调用
async function callZhipuAI(message) {
    try {
        console.log('发送消息:', message);

        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "chatglm_turbo",
                messages: [{
                    role: "user",
                    content: message
                }],
                temperature: 0.7,
                top_p: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('代理服务器错误:', errorData);
            throw new Error(errorData.error || '服务器错误');
        }

        const data = await response.json();
        console.log('收到响应:', data);

        // 直接返回内容字符串
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI接口调用失败:', error);
        throw error;  // 向上传递错误
    }
}

// 修改表单提交处理
document.getElementById('chat-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (message) {
        try {
            // 添加用户消息
            addMessage(message, 'user');
            
            // 显示等待状态
            const loadingMessage = addMessage('正在思考...', 'ai');
            
            // 调用智谱AI接口
            const response = await callZhipuAI(message);
            console.log('AI响应:', response); // 添加调试日志
            
            // 移除等待消息
            loadingMessage.remove();
            
            // 显示AI回复
            if (typeof response === 'string') {
                // 处理换行符
                const formattedMessage = response.replace(/\\n/g, '<br>');
                addMessage(formattedMessage, 'ai');
            } else {
                addMessage('抱歉，我现在无法回答这个问题。', 'ai');
            }
            
            // 清空输入框
            input.value = '';
        } catch (error) {
            console.error('对话出错:', error);
            addMessage('抱歉，发生了一些错误。', 'ai');
        }
    }
});

// 修改添加消息的函数
function addMessage(text, type) {
    const messagesContainer = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    // 使用 innerHTML 来支持 HTML 标签（如换行）
    messageDiv.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到最新消息
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
} 