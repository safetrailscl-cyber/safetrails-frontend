export interface POIData {
    lat: number;
    lng: number;
    radius?: number;
    category: "ten_precaucion" | "reduce_velocidad" | "cuidado";
}
export declare const poiService: {
    getAll(token: string): Promise<import("axios").AxiosResponse<any, any, {}>>;
    create(data: POIData, token: string): Promise<import("axios").AxiosResponse<any, any, {}>>;
    update(id: string, data: POIData, token: string): Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete(id: string, token: string): Promise<import("axios").AxiosResponse<any, any, {}>>;
};
