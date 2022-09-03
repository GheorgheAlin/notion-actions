import { format } from "date-fns";

export class DateUtils {
    public static dateAsString(date = new Date()): string {
        return format(date, 'yyyy-MM-dd')
    }
}