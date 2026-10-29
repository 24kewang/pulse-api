import { getAnonClient } from "../../common/supabase";
import { TeamMember, TeamMemberRow, TeamQuery } from "./team-schemas";

export function toTeamMember(row: TeamMemberRow): TeamMember {
    return {
        id: row.id,
        name: row.name,
        position: row.position,
        committee: row.team,
        year: row.academic_year,
        imageUrl: row.image_url,
        linkedinUrl: row.linkedin_url,
        email: row.email,
        displayOrder: row.display_order,
    };
}

export async function listTeamMembers(query: TeamQuery = {}): Promise<TeamMember[]> {
    let request = getAnonClient().from("team_members").select("*").order("team").order("display_order").order("name");

    if (query.committee) {
        request = request.eq("team", query.committee);
    }
    if (query.year) {
        request = request.eq("academic_year", query.year);
    }

    const { data, error } = await request;
    if (error) {
        throw error;
    }

    return data.map(toTeamMember);
}
