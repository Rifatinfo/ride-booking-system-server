import axios from "axios";
import AppError from "../../errorHelpers/AppError";

export const getCoordinate = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
    )}&format=json&limit=1`;

    const res = await axios.get(url, {
        headers: { "User-Agent": "XRiders" },
    });

    if (!res.data.length) {
        throw new AppError(404, "Invalid Address");
    }

    return {
        lat: parseInt(res.data[0].lat),
        lng: parseInt(res.data[0].lon)
    }
}

export const getDistance = async (
    pickup: { lat: number; lng: number },
    dest: { lat: number, lng: number }) => {

    const url = `http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dest.lng},${dest.lat}?overview=false`;

    const res = await axios.get(url);
    if(!res.data.routes.length){
       throw new AppError(404, "Could not calculate distance");
    }

    return res.data.routes[0].distance / 1000;  // km 
}

export const calculate = (distanceKm : number) => {
    const baseFare = 100;
    const perKmRate = 20;

    return baseFare + distanceKm * perKmRate; 
}