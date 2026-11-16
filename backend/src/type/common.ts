export interface AuditFields {
    created_by: string | null
    created_at: Date
    updated_by: string | null
    updated_at: Date | null
    deleted_by: string | null
    deleted_at: Date | null
}

export interface ListQuery {
    page?: number
    limit?: number
    sort?: string
    dir?: "asc" | "desc"
}

export function buildSort(
    sortable: readonly string[],
    sort: string | undefined,
    dir: "asc" | "desc" | undefined,
    fallback: [string, "ASC" | "DESC"][],
): [string, "ASC" | "DESC", "NULLS LAST"][] {
    if (sort && sortable.includes(sort)) {
        return [[sort, dir === "desc" ? "DESC" : "ASC", "NULLS LAST"], ...fallback.map((f) => [f[0], f[1], "NULLS LAST"] as [string, "ASC" | "DESC", "NULLS LAST"])];
    }
    return fallback.map((f) => [f[0], f[1], "NULLS LAST"] as [string, "ASC" | "DESC", "NULLS LAST"]);
}

export interface PaginatedResponse<T> {
    data: T[]
    page: number
    limit: number
    total: number
    total_pages: number
}
