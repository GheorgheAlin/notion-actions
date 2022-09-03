import { addDays, formatISO } from "date-fns";
import { DatabaseProperties, PageProperties } from "notion-api-types/requests";
import { Block, Page } from "notion-api-types/responses";
import { ToDo } from "notion-api-types/responses/blocks";
import { DateUtils } from "../utils/DateUtils";
import { NotionClient } from "./NotionClient";

export class TaskFromNotesService {
    constructor(private readonly client: NotionClient) { }

    public async getTodaysNotes(): Promise<Array<Page>> {
        return this.client.getDatabaseEnties(process.env.NOTE_DATABASE_ID!, {
            property: "Date",
            date: {
                equals: DateUtils.dateAsString(new Date("2022-08-27")),
            },
        });
    }

    public async getPageTodoBlocks(pageId: string): Promise<Array<ToDo>> {
        const blocks: Array<Block> = await this.client.getPageBlocks(pageId);
        return blocks
            .filter((block: Block) => block.type === "to_do")
            .map((block: Block) => block as ToDo)
    }

    public async createTask(
        parentNoteId: string,
        databaseId: string,
        todo: ToDo
    ): Promise<void> {
        const title: PageProperties.Title = {
            title: [
                {
                    text: {
                        content: todo.to_do.rich_text.map((text) => text.plain_text).join(" ")
                    }
                }
            ]
        }
        await this.client.createDatabaseEntry(
            databaseId,
            {
                Name: title,
                Status: {
                    select: {
                        name: todo.to_do.checked ? "Done" : "Pending",
                        color: todo.to_do.checked ? "green" : "yellow",
                    },
                },
                "Daily Notes": {
                    relation: [
                        {
                            id: parentNoteId,
                        },
                    ],
                },
                "Due Date": {
                    date: {
                        start: formatISO(addDays(new Date(), 7)),
                    },
                },
            },
            []
        );
    }
}

