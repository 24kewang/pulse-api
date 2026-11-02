import Config from "../../common/config";
import { getAnonClient } from "../../common/supabase";
import { PastEvent } from "./past-events-schemas";

function displayOrder(a: { sort_order: number; id: string }, b: { sort_order: number; id: string }): number {
    return a.sort_order - b.sort_order || a.id.localeCompare(b.id);
}

export async function listPastEvents(): Promise<PastEvent[]> {
    const client = getAnonClient();
    // One cutoff per request. Change this predicate here if the archive becomes curated.
    const cutoff = new Date().toISOString();
    const { data, error } = await client
        .from("events")
        .select(
            `
            id, title, description, start_time, end_time,
            event_photos (id, storage_path, alt_text, caption, sort_order),
            competition_projects (id, project_name, competition_type, team_name, project_url, repository_url, sort_order)
        `,
        )
        .lte("end_time", cutoff)
        .order("start_time", { ascending: false })
        .order("id", { ascending: true });

    if (error) {
        throw error;
    }

    return (data ?? []).map((row): PastEvent => {
        const photos = [...row.event_photos].sort(displayOrder).map((photo) => ({
            id: photo.id,
            url: client.storage.from(Config.PAST_EVENT_PHOTOS_BUCKET).getPublicUrl(photo.storage_path).data.publicUrl,
            altText: photo.alt_text,
            caption: photo.caption,
        }));
        const projects = [...row.competition_projects].sort(displayOrder).map((project) => ({
            id: project.id,
            projectName: project.project_name,
            competitionType: project.competition_type,
            teamName: project.team_name,
            projectUrl: project.project_url,
            repositoryUrl: project.repository_url,
        }));

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            startTime: row.start_time,
            endTime: row.end_time,
            imageUrl: photos[0]?.url ?? null,
            imageAlt: photos[0]?.altText ?? null,
            photos,
            projects,
        };
    });
}
