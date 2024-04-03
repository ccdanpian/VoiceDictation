const OPENROUTER_API_KEY = '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'; // 请替换为你的 API 密钥
let accumulatedContent = '';
let role_first = '';

fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer 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`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "stream": "True",
    "model": "openai/gpt-4-turbo-preview",
    "messages": [
      {"role": "user", "content": "how are you? tell me a story use about 200 words in chinese"}
    ]
  })
}).then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  function processChunk({ done, value }) {
    if (done) {
      console.log('Stream complete');
      console.log('Role:', role_first);
      console.log('Final Accumulated Content:', accumulatedContent);
      return;
    }

    buffer += decoder.decode(value, {stream: true});

    let lines = buffer.split('\n');
    buffer = lines.pop();

    lines.forEach(line => {
      if (line.startsWith('data: ')) {
        // 检查行是否为有效的JSON，以及是否为结束标志
        let contentLine = line.substring('data: '.length).trim();
        // 处理结束标志
        if (contentLine === '[DONE]') {
          console.log('All data received. Stream ended.');
          reader.cancel(); // 取消流的读取，结束传输
          return;
        }
        let json;
        try {
          json = JSON.parse(contentLine);
          let content = json.choices[0].message.content; // 提取content内容
          role_first = json.choices[0].message.role;
          accumulatedContent += content;                // 累加到累积内容中
          //console.log(content, '');              // 打印累积内容
          process.stdout.write(content);
        } catch(e) {
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
