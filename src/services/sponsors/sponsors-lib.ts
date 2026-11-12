import { getAnonClient } from "../../common/supabase";

import { Sponsor, SponsorQuery, SponsorRow } from "./sponsors-schemas";

export function toSponsor(row: SponsorRow): Sponsor {
    return {
        id: row.id,
        name: row.name,
        logoUrl: row.logo_url,
        websiteUrl: row.website_url,
        description: row.description,
        year: row.year,
        createdAt: row.created_at,
    };
}

export async function listSponsors(query: SponsorQuery = {}): Promise<Sponsor[]> {
    let request = getAnonClient().from("sponsors").select("*").order("name");

    if (query.year) {
        request = request.eq("year", Number(query.year));
    }

    const { data, error } = await request;

    if (error) {
        throw error;
    }

    return data.map(toSponsor);
}
