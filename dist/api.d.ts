export interface Ad {
    id: string;
    text: string;
    url: string;
    brand: string | null;
    color?: string;
    letter?: string;
    bid: number;
    /** Signed single-use impression token; null for house ads (never reported). */
    token: string | null;
    house?: boolean;
}
export declare function fetchAd(apiKey: string): Promise<Ad | null>;
export declare function reportImpression(token: string, apiKey: string): Promise<number>;
