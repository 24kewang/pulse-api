import { getAnonClient } from "../../common/supabase";
import { Event, EventRow } from "./events-schemas";

export function toEvent(row: EventRow): Event {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        startTime: row.start_time,
        endTime: row.end_time,
    };
}

export async function listEvents(from?: string, to?: string): Promise<Event[]> {
    let query = getAnonClient().from("events").select("*");
    if (from) {
        query = query.gte("start_time", from);
    }
    if (to) {
        query = query.lt("start_time", to);
    }
    const { data, error } = await query.order("start_time");
    if (error) {
        throw error;
    }
    return data.map(toEvent);
}
