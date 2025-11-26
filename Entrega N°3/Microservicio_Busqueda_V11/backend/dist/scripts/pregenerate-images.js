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
Object.defineProperty(exports, "__esModule", { value: true });
// Script para pregenerar/regenerar caché de imágenes optimizadas
const imageService_1 = require("../services/imageService");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🖼️  Iniciando pregeneración de imágenes...\n');
        imageService_1.ImageService.initialize();
        yield imageService_1.ImageService.pregenerateCategories();
        console.log('\n✅ Proceso completado exitosamente');
        process.exit(0);
    });
}
main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
