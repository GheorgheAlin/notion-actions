import { addDays, formatISO } from "date-fns";
import { PageProperties } from "notion-api-types/requests";
import { Block, Page } from "notion-api-types/responses";
import { ToDo } from "notion-api-types/responses/blocks";
import { TodoModel } from "../model/TodoModel";
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
        const isAlreadyProcessed: boolean = await this.isAlreadyProcessed(databaseId, todo);
        if (isAlreadyProcessed) {
            return;
        }

        const model: TodoModel = new TodoModel(todo);
        await this.client.createDatabaseEntry(
            databaseId,
            {
                Name: model.asProperty.title(),
                Status: model.asProperty.status(),
                "Daily Notes": model.asProperty.noteRelation(parentNoteId),
                "Due Date": model.asProperty.dueDate(),
                "original_id": model.asProperty.originalId()
            },
            []
        );
    }

    private async isAlreadyProcessed(
        databaseId: string,
        todo: ToDo
    ): Promise<boolean> {
        const existingEntry = await this.client.getDatabaseEnties(databaseId, {
            property: "original_id",
            rich_text: {
                equals: todo.id
            }
        });
        return Boolean(existingEntry?.length);
    }

    public async markNoteAsProcessed(id: string): Promise<void> {
        this.client.updatePageProperty(
            id,
            {
                Status: {
                    type: "select",
                    select: {
                        color: "green",
                        name: "Processed"
                    }
                }
            }
        )
    }
}

