import { NotImplementedError } from "../../common/errors";
import { Event, EventRow } from "./events-schemas";

// TODO: map database columns (snake_case) to the API shape defined in EventSchema.
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

export async function listEvents(): Promise<Event[]> {
    // TODO: create the events table (supabase/migrations), then replace the throw below with:
    //   const { data, error } = await getAnonClient().from("events").select("*").order("start_time");
    //   if (error) throw error;
    //   return data.map(toEvent);
    // (import getAnonClient from "../../common/supabase")
    throw new NotImplementedError("Listing events");
}
