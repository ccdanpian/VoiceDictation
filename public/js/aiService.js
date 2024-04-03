// aiService.js
function processTranscription(transcription, responseHandler) {
    const OPENROUTER_API_KEY = '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'; // 请替换为你的 API 密钥
    let accumulatedContent = '';
    let role_first = '';
    
    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "stream": "True",
            "model": "openai/gpt-4-turbo-preview",
            "messages": [
                {"role": "user", "content": transcription}
            ]
        })
    }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
    
        function processChunk({ done, value }) {
            if (done) {
                console.log('Stream complete');
                responseHandler(accumulatedContent, role_first);
                return;
            }

            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n');
            buffer = lines.pop();
    
            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    let contentLine = line.substring('data: '.length).trim();
                    if (contentLine === '[DONE]') {
                        reader.cancel(); // 取消流的读取，结束传输
                        return;
                    }
                    try {
                        let json = JSON.parse(contentLine);
                        let content = json.choices[0].message.content; // 提取content内容
                        role_first = json.choices[0].message.role;
                        accumulatedContent += content;                // 累加到累积内容中
                        // responseHandler 可能会按需更新页面内容
                        responseHandler(content, role_first);
                    } catch (e) {
                        console.error('Invalid JSON:', line);
                    }
                }
            });
    
            reader.read().then(processChunk).catch(err => {
                console.error('Stream reading error', err);
            });
        }

        reader.read().then(processChunk).catch(err => {
            console.error('Stream setup error', err);
        });
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}

// 导出函数以便在其他模块中使用
if (typeof exports === 'object') {
    module.exports = { processTranscription };
}
