import "dotenv/config";
import { addDays, formatISO } from "date-fns";

const { Client, collectPaginatedAPI } = require("@notionhq/client")

interface Task {
  title: string;
  is_done: string;
  id: string;
}

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const extractToDoList = async (): Promise<[string, Task[]]> => {
  const databaseEntries = await notion.databases.query({
    database_id: process.env.NOTE_DATABASE_ID!,
    filter: {
      property: "Date",
      date: {
        equals: "2022-08-27",
      },
    },
  });
  const things: Task[] = [];
  const entry = databaseEntries.results[0];
  const blocks = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: entry.id,
  });
  const todoBlocks = blocks
    .filter((block) => block["type"] === "to_do")
    .map((block) => ({ id: block.id, ...block["to_do"] }));

  for (const block of todoBlocks) {
    things.push({
      id: block.id,
      is_done: block["checked"],
      title: block["rich_text"].map((line) => line["plain_text"]).join(),
    });
  }
  return [entry.id, things];
};

const act = async () => {
  const [noteId, todos] = await extractToDoList();
  for (const todo of todos) {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: process.env.TASK_DATABASE_ID!,
      },
      properties: {
        Name: {
          title: [
            {
              type: "text",
              text: {
                content: todo.title,
              },
            },
          ],
          type: "title",
        },
        Status: {
          select: {
            name: todo.is_done ? "Done" : "Pending",
            color: todo.is_done ? "green" : "yellow",
          },
        },
        "Daily Notes": {
          relation: [
            {
              id: noteId,
            },
          ],
        },
        "Due Date": {
          date: {
            start: formatISO(addDays(new Date(), 7)),
          },
        },
      },
      children: [
        {
            object: "block",
            "heading_2": {
                "rich_text": [
                    {
                        "text": {
                            "content": "Lacinato kale"
                        }
                    }
                ]
            }
        }
      ]
    });
  }
};

act();
