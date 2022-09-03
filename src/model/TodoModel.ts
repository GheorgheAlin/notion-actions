import { format } from "date-fns";
import { Mentions, PageProperties, RichTexts, RichText } from "notion-api-types/requests";
import { NotionDate } from "notion-api-types/requests/global";
import { ToDo } from "notion-api-types/responses/blocks";
import { DateUtils } from "../utils/DateUtils";

export class TodoModel {
    constructor(private readonly data: ToDo) { }


    private get mentionedDate(): Mentions.Date | null {

        const mentionedDates: Mentions.Date[] = this.data.to_do.rich_text
            .filter((section: RichText) => section.type === "mention")
            .filter((mention: RichText) => (mention as RichTexts.Mention).mention.type === "date")
            .map((mention: RichText) => (mention as RichTexts.Mention).mention as Mentions.Date);
        return mentionedDates?.length ? mentionedDates[0] : null;
    }

    public get asProperty() {
        return {
            title: (): PageProperties.Title => {
                return {
                    title: [
                        {
                            text: {
                                content: this.data.to_do.rich_text.map((text) => {
                                    if (text.type === "mention" && (text as RichTexts.Mention).mention.type === "date") {
                                        const dateMention = (text as RichTexts.Mention).mention as Mentions.Date;
                                        return format(new Date(dateMention.date.start), "dd-MM-yyyy HH:mm")
                                    }
                                    return text.plain_text
                                }
                                ).join(" ")
                            }
                        }
                    ]
                };
            },
            originalId: (): PageProperties.RichText => {
                return {
                    rich_text: [
                        {
                            text: {
                                content: this.data.id
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
                return {
                    date: this.mentionedDate?.date ?? { start: DateUtils.daysFromDateAsString(7) }
                }
            },

        }
    }
}