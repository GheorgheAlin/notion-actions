import { addDays, format, formatISO } from "date-fns";

export class DateUtils {
    public static dateAsString(date = new Date()): string {
        return format(date, 'yyyy-MM-dd')
    }

    public static daysFromDateAsString(howFar: number, date: Date = new Date()): string {
        return formatISO(addDays(date, howFar));
    }
}