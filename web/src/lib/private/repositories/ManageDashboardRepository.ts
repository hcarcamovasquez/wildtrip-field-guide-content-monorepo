import { count, eq } from 'drizzle-orm'

import { db } from '../../db/config'
import { news, protectedAreas, species } from '../../db/schema'

export class ManageDashboardRepository {
  static async getStats() {
    const [speciesCount, protectedAreasCount, newsCount] = await Promise.all([
      db.select({ count: count() }).from(species).where(eq(species.status, 'published')),
      db.select({ count: count() }).from(protectedAreas).where(eq(protectedAreas.status, 'published')),
      db.select({ count: count() }).from(news).where(eq(news.status, 'published')),
    ])

    return {
      speciesCount: Number(speciesCount[0]?.count || 0),
      protectedAreasCount: Number(protectedAreasCount[0]?.count || 0),
      newsCount: Number(newsCount[0]?.count || 0),
    }
  }
}
