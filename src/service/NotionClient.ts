import { Client } from "@notionhq/client";
import { ListBlockChildrenResponse, QueryDatabaseResponse, CreatePageParameters, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { PageProperty } from "notion-api-types/requests";
import { Block, Page } from "notion-api-types/responses";

export class NotionClient {
    private readonly client: Client;
    constructor(token: string) {
        this.client = new Client({
            auth: token,
        });

    }

    public async getDatabaseEnties(
        databaseId: string,
        filter: any = {}
    ): Promise<Array<Page>> {
        const response: QueryDatabaseResponse = await this.client.databases.query({
            database_id: databaseId,
            filter,
        });

        return response.results.map((result) => result as Page)
    }

    public async getPageBlocks(
        pageId: string,
    ): Promise<Array<Block>> {
        const response: ListBlockChildrenResponse = await this.client.blocks.children.list({
            block_id: pageId
        });
        return response.results.map((result) => result as Block);
    }

    public async createDatabaseEntry(
        databaseId: string,
        properties: Record<string, PageProperty>,
        children: Block[]
    ): Promise<string> {
        const request: CreatePageParameters = {
            parent: {
                type: "database_id",
                database_id: databaseId,
            },
            properties,
            children: children.map((block: Block) => block as any),
        } as CreatePageParameters;
        const response = await this.client.pages.create(request);
        return response.id;
    }

    public async updatePageProperty(
        id: string,
        properties: Record<string, PageProperty>,
    ) {
        await this.client.pages.update({
            page_id: id,
            properties: properties as any
        });
    }

}
