import ora from "ora";
import inquirer from "inquirer";
import type { ChatCompletionMessageParam as Message } from "openai/resources/chat/completions";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export class ChatSession {
  private conversation: Message[] = [];

  async getResponse(messages: Message[]) {
    const result = await client.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });
    const text = result.choices[0]?.message.content;

    return { text };
  }

  async getInput(): Promise<string> {
    const { input } = await inquirer.prompt([
      {
        type: "input",
        name: "input",
        message: "> ",
      },
    ]);

    return input;
  }

  async start() {
    const spinner = ora();

    while (true) {
      const userInput = await this.getInput();

      if (userInput.toLowerCase() === "/exit") {
        console.log("Goodbye!");
        break;
      }

      if (!userInput) {
        continue;
      }

      this.conversation.push({ role: "user", content: userInput });
      spinner.text = "Procesing...";
      spinner.color = "magenta";
      spinner.start();

      const { text } = await this.getResponse(this.conversation);

      spinner.stop();

      if (text) {
        console.log(`\n● ${text}\n`);
        this.conversation.push({ role: "assistant", content: text });
      }
    }
  }
}
