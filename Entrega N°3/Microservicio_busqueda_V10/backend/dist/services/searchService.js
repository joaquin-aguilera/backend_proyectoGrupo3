"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const Search_1 = __importDefault(require("../models/Search"));
const Click_1 = __importDefault(require("../models/Click"));
class SearchService {
    static saveSearch(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const search = new Search_1.default({
                userId: data.userId,
                queryText: data.queryText,
                filters: data.filters,
                results: data.results,
                requestedAt: new Date(),
                page: 1,
                pageSize: 20
            });
            return yield search.save();
        });
    }
    static getSuggestions(queryText, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                queryText: { $regex: queryText, $options: 'i' }
            };
            if (userId) {
                query.userId = userId;
            }
            const searches = yield Search_1.default.find(query)
                .sort({ requestedAt: -1 })
                .limit(5)
                .select('queryText filters');
            return searches.map(search => ({
                texto: search.queryText,
                tipo: 'historial',
                filtros: search.filters
            }));
        });
    }
    static getSearchHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = userId ? { userId } : {};
            return yield Search_1.default.find(query).sort({ requestedAt: -1 }).limit(10);
        });
    }
    static saveClick(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Click_1.default.create({
                searchId: data.searchId,
                productId: data.productId,
                userId: data.userId,
                clickedAt: new Date()
            });
        });
    }
    static getClicksByProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Click_1.default.find({ productId })
                .sort({ clickedAt: -1 })
                .populate('searchId', 'queryText filters');
        });
    }
    static getClicksBySearch(searchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Click_1.default.find({ searchId }).sort({ clickedAt: -1 });
        });
    }
}
exports.SearchService = SearchService;
