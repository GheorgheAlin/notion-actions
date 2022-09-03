import "dotenv/config";
import { ToDo } from "notion-api-types/responses/blocks";
import { NotionClient } from "./service/NotionClient";
import { TaskFromNotesService } from "./service/TaskFromNotesService";

const setup = async () => {
  const notionClient: NotionClient = new NotionClient(process.env.NOTION_TOKEN!);
  const service: TaskFromNotesService = new TaskFromNotesService(notionClient);

  const dailyNotePages = await service.getTodaysNotes();
  for (const page of dailyNotePages) {
    const todos: Array<ToDo> = await service.getPageTodoBlocks(page.id);
    for (const todo of todos) {
      await service.createTask(page.id, process.env.TASK_DATABASE_ID!, todo)
    }
  }
}

setup();
const act = async () => {
  // for (const todo of todos) {
  //   const response = await notion.pages.create({
  //     parent: {
  //       type: "database_id",
  //       database_id: process.env.TASK_DATABASE_ID!,
  //     },
  //     properties: {
  //       Name: {
  //         title: [
  //           {
  //             type: "text",
  //             text: {
  //               content: todo.title,
  //             },
  //           },
  //         ],
  //         type: "title",
  //       },
  //       Status: {
  //         select: {
  //           name: todo.is_done ? "Done" : "Pending",
  //           color: todo.is_done ? "green" : "yellow",
  //         },
  //       },
  //       "Daily Notes": {
  //         relation: [
  //           {
  //             id: noteId,
  //           },
  //         ],
  //       },
  //       "Due Date": {
  //         date: {
  //           start: formatISO(addDays(new Date(), 7)),
  //         },
  //       },
  //     },
  //     children: [
  //       {
  //         object: "block",
  //         "heading_2": {
  //           "rich_text": [
  //             {
  //               "text": {
  //                 "content": "Lacinato kale"
  //               }
  //             }
  //           ]
  //         }
  //       }
  //     ]
  //   });
  // }
};

act();
