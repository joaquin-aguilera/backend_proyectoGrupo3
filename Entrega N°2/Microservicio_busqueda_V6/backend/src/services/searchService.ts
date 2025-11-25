import Search, { ISearch } from '../models/Search';
import Click from '../models/Click';
import { FilterQuery } from 'mongoose';

export interface SearchFilters {
  precio?: string;
  categoria?: string;
  ubicacion?: string;
  condicion?: string;
}

export interface SearchResult {
  productId: string;
  position: number;
  score?: number;
}

export interface Suggestion {
  texto: string;
  tipo: 'historial' | 'coincidencia';
  filtros?: SearchFilters;
}

export class SearchService {
  static async saveSearch(data: {
    userId?: string;
    queryText: string;
    filters?: SearchFilters;
    results: SearchResult[];
  }): Promise<ISearch> {
    const search = new Search({
      userId: data.userId,
      queryText: data.queryText,
      filters: data.filters,
      results: data.results,
      requestedAt: new Date(),
      page: 1,
      pageSize: 20
    });
    return await search.save();
  }

  static async getSuggestions(queryText: string, userId?: string): Promise<Suggestion[]> {
    const query: FilterQuery<ISearch> = {
      queryText: { $regex: queryText, $options: 'i' }
    };
    if (userId) {
      query.userId = userId;
    }
    
    const searches = await Search.find(query)
      .sort({ requestedAt: -1 })
      .limit(5)
      .select('queryText filters');
      
    return searches.map(search => ({
      texto: search.queryText,
      tipo: 'historial' as const,
      filtros: search.filters
    }));
  }

  static async getSearchHistory(userId?: string): Promise<ISearch[]> {
    const query = userId ? { userId } : {};
    return await Search.find(query).sort({ requestedAt: -1 }).limit(10);
  }

  static async saveClick(data: {
    searchId: string;
    productId: string;
    userId?: string;
  }): Promise<void> {
    await Click.create({
      searchId: data.searchId,
      productId: data.productId,
      userId: data.userId,
      clickedAt: new Date()
    });
  }
}