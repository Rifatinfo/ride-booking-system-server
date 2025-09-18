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
exports.calculate = exports.getDistance = exports.getCoordinate = void 0;
const axios_1 = __importDefault(require("axios"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const getCoordinate = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = yield axios_1.default.get(url, {
        headers: { "User-Agent": "XRiders" },
    });
    if (!res.data.length) {
        throw new AppError_1.default(404, "Invalid Address");
    }
    return {
        lat: parseInt(res.data[0].lat),
        lng: parseInt(res.data[0].lon)
    };
});
exports.getCoordinate = getCoordinate;
const getDistance = (pickup, dest) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dest.lng},${dest.lat}?overview=false`;
    const res = yield axios_1.default.get(url);
    if (!res.data.routes.length) {
        throw new AppError_1.default(404, "Could not calculate distance");
    }
    return res.data.routes[0].distance / 1000; // km 
});
exports.getDistance = getDistance;
const calculate = (distanceKm) => {
    const baseFare = 100;
    const perKmRate = 20;
    return baseFare + distanceKm * perKmRate;
};
exports.calculate = calculate;
