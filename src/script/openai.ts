import OpenAI from "openai";
import {readConfig} from "./settings";
import {ChatCompletionCreateParamsNonStreaming} from "openai/src/resources/chat/completions";
import {invoke} from "@tauri-apps/api/tauri";
// import { fetch } from 'undici'; // as one example


const prompt_template: string = `
### 任务指令
你是一个音视频处理专家，擅长使用ffmpeg命令处理视频和音频，请根据我的【需求】生成一个符合要求的【ffmpeg命令】，要求如下.
回答应该遵循以下原则：
1. 生成的命令行一定要满足我的【需求】，在进行回答时仅返回命令行内容，不要对命令行进行解释和说明，不要做多余的事情！
2. 如果【需求】与媒体处理有冲突，请直接返回【错误】，不要做多余的事情！
3. 如果【需求】通过【ffmpeg命令】无法处理，请直接返回【错误】，不要做多余的事情！
4. 认真思考【需求】，尽可能高质量的完成媒体处理；
5. 处理媒体的命令一定不会修改或者损坏原媒体文件；
6. 如果媒体输出目录未声明，则默认输出到当前目录。
\n
### 示例【需求】
从“C:\\Desktop\\pic\\input.mp4”中提取出音频文件，要无损音质。
### 示例【ffmpeg命令】
ffmpeg -i 'C:\\Desktop\\pic\\input.mp4' -vn -c:a flac 'C:\\Desktop\\pic\\output.flac'
\n
现在让我们开始任务：
### 【需求】
{0}
### 【ffmpeg命令】
`
;

// const gpt_models: string = ref<"gpt-3.5-turbo-1106" | "gpt-4-1106-preview"
//     | "gpt-4-32k-1106-preview" | "gpt-3.5-turbo-16k-1106-preview">("gpt-3.5-turbo-1106")

export async function completeChat(model: string, question: string): Promise<string> {
    const prompt = format(prompt_template, question);
    const conf = await readConfig();
    console.log('conf_read', conf)
    let completion;
    if (model.startsWith('qwen')) {
        if (!conf.qwen.ak) {
            throw new Error('通义千问的AK未设置')
        }
        completion = await callPostRequest('https://dashscope.aliyuncs.co/compatible-mode/v1/chat/completions'
            , conf.qwen.ak
            , JSON.stringify({
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }));
    }

    if (model.startsWith('gpt')) {
        if (!conf.gpt.ak) {
            throw new Error('OpenAI的AK未设置')
        }
        const openai = new OpenAI({apiKey: conf.gpt.ak, dangerouslyAllowBrowser: true})
        console.log('openai:\n', openai)
        console.log('prompt:\n', prompt)
        // @ts-ignore
        completion = await openai.chat.completions.create({
            model: model,
            stream: false,
            max_tokens: 2048,
            temperature: 0.1,
            top_p: 0.95,
            messages: [
                {role: "system", content: "You are a helpful assistant."},
                {
                    role: "user",
                    content: prompt,
                },
            ],
        })
            .then((res) => {
                return res.choices[0].message.content ?? '';
            })
            .catch((reason) => {
                console.log('error:\n', reason)
            });
    }
    console.log('completion:\n', completion)
    console.log('completion:\n',)
    if (completion) {
        const data = JSON.parse(completion);
        return data.choices[0].message.content;
    } else {
        return completion ?? '';
    }
}

export async function callPostRequest(url: string, token: string, body: any): Promise<string> {
    try {
        const responseText: string = await invoke('post_request',
            {url: url, token: token, data: body});
        console.log('Response_callPostRequest:', responseText);
        return responseText;
    } catch (error) {
        console.error('Error:', error);
    }
    return '';
}


function format(template: string, ...args: any[]) {
    return template.replace(/{(\d+)}/g, (match, number) => args[number]);
}
