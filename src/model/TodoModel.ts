import { Mentions, PageProperties, RichTexts, RichText } from "notion-api-types/requests";
import { NotionDate } from "notion-api-types/requests/global";
import { ToDo } from "notion-api-types/responses/blocks";
import { DateUtils } from "../utils/DateUtils";

export class TodoModel {
    constructor(private readonly data: ToDo) { }

    public get asProperty() {
        return {
            title: (): PageProperties.Title => {
                return {
                    title: [
                        {
                            text: {
                                content: this.data.to_do.rich_text.map((text) => text.plain_text).join(" ")
                            }
                        }
                    ]
                };
            },
            status: (): PageProperties.Select => {
                return {
                    select: {
                        name: this.data.to_do.checked ? "Done" : "Pending",
                        color: this.data.to_do.checked ? "green" : "yellow",
                    },
                }
            },
            noteRelation: (pageId: string): PageProperties.Relation => {
                return {
                    relation: [
                        {
                            id: pageId,
                        },
                    ],
                }
            },
            dueDate: (): PageProperties.Date => {
                const mentionedDates: Mentions.Date[] = this.data.to_do.rich_text
                    .filter((section: RichText) => section.type === "mention")
                    .filter((mention: RichText) => (mention as RichTexts.Mention).mention.type === "date")
                    .map((mention: RichText) => (mention as RichTexts.Mention).mention as Mentions.Date);

                let dueDate: NotionDate = { start: DateUtils.daysFromDateAsString(7) };
                if (mentionedDates.length === 1) {
                    dueDate = mentionedDates[0].date;
                }

                return {
                    date: dueDate
                }
            },

        }
    }
}